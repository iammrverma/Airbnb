const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const methodOverride = require("method-override");
const path = require("path");
const helmet = require("helmet");
const Listing = require("./models/listing");
const ejsMate = require("ejs-mate");

const app = express();

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017/airbnb";

// Middleware
app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(helmet());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => res.send("Welcome!!!"));

// Index route
app.get("/listings", async (req, res) => {
  try {
    const listings = await Listing.find({});
    res.render("listings/listings", { listings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).send("An error occurred while fetching listings.");
  }
});

// Create route
app.post("/listings", async (req, res) => {
  try {
    const { title, price } = req.body.listing;
    if (!title || !price) {
      return res.status(400).send("Title and price are required.");
    }

    const listing = new Listing(req.body.listing);
    await listing.save();
    res.redirect("/listings");
  } catch (error) {
    console.error("Error saving listing:", error);
    res.status(500).send("An error occurred while saving the listing.");
  }
});

// Render create view
app.get("/listings/new", (req, res) => {
  res.render("listings/new", { listing: null });
});

// View route
app.get("/listings/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).render("404", { message: "Listing not found" });
    }
    res.render("listings/listing", { listing });
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).send("An error occurred while fetching the listing.");
  }
});

// Edit route
app.patch("/listings/:id", async (req, res) => {
  try {
    const updatedData = req.body.listing;
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.redirect(`/listings/${req.params.id}`);
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).send("An error occurred while updating the listing");
  }
});

// Destroy route
app.delete("/listings/:id", async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.redirect("/listings");
  } catch (error) {
    console.error("Error deleting listing:", error);
    res
      .status(500)
      .send("An error occurred while trying to delete the listing");
  }
});

// Render form to edit
app.get("/listings/:id/edit", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).render("404", { message: "Listing not found" });
    }
    res.render("listings/new", { listing });
  } catch (error) {
    console.error("Error fetching listing for editing:", error);
    res
      .status(500)
      .send("An error occurred while fetching the listing for editing.");
  }
});

// Connect to the database and start the server
async function main(dbUrl) {
  try {
    await mongoose.connect(dbUrl); // No need for useNewUrlParser or useUnifiedTopology
    console.log("Connected to database");
    app.listen(PORT, () => {
      console.log(`App listening at PORT ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1); // Exit process with failure
  }
}

main(DB_URL);

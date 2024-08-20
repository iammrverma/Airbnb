const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const methodOverride = require("method-override");
const path = require("path");

const Listing = require("./models/listing");
const { emit } = require("process");
const app = express();

const PORT = 3000;
const DB_URL = "mongodb://127.0.0.1:27017/airbnb";

const main = async (url) => await mongoose.connect(url);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.get("/", (req, res) => res.send("Welcome!!!"));

app.get("/listings", async (req, res) => {
  let listings = await Listing.find({});
  res.render("listings/listings", { listings });
});

app.post("/listings", async (req, res) => {
  try {
    const listingData = req.body.listing;
    if (!listingData) {
      return res.status(400).send("Invalid listing data.");
    }
    const listing = new Listing(listingData);
    await listing.save();
    res.redirect("/listings");
  } catch (error) {
    console.error("Error saving listing:", error);
    res.status(500).send("An error occurred while saving the listing.");
  }
});

app.get("/listings/new", async (req, res) => {
  res.render("listings/new", { listing: null });
});

app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/listing", { listing });
});

app.patch("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body.listing;
    const listing = await Listing.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!listing) {
      return res.status(404).send("Listing not found");
    }

    res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).send("An error occurred while updating the listing");
  }
});

app.delete("/listings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
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

app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/new", { listing });
});

app.listen(PORT, () => console.log(`app.listneing at PORT ${PORT}`));
main(DB_URL)
  .then(() => console.log("connected to database"))
  .catch((err) => console.log(err));

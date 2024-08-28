const express = require("express");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const ejs = require("ejs");
const path = require("path");
const helmet = require("helmet");

const Listing = require("./models/listing");
const Review = require("./models/review");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js"); // schemas of form validation

const app = express();

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017/airbnb";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"], // Allow scripts from self and cdn.jsdelivr.net
        imgSrc: ["'self'", "https://images.unsplash.com", "data:"], // Allow images from self, Unsplash, and data URIs
        // Add other directives as needed
      },
    },
  })
);

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Custom Middlewares
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((e) => e.message).join(", ");
    new ExpressError(400, errMsg);
  }
  return next();
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((e) => e.message).join(", ");
    new ExpressError(400, errMsg);
  }
  return next();
};

// Routes
app.get("/", (req, res) => res.send("Welcome!!!"));

// Index route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/listings", { listings });
  })
);

// Create route
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const { listing } = req.body;

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    return res.redirect("/listings");
  })
);

// Render create view
app.get("/listings/new", (req, res) => {
  res.render("listings/new", { listing: null });
});

// View route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res, next) => {
    const listing = await Listing.findById(req.params.id).populate("reviews");
    if (!listing) {
      throw new ExpressError(404, "Listing Not Found!");
    }
    res.render("listings/listing", { listing });
  })
);

// Update route
app.patch(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const { listing: updatedData } = req.body;

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!listing) {
      throw new ExpressError(404, "Listing Not Found");
    }

    res.redirect(`/listings/${req.params.id}`);
  })
);

// Destroy route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      throw new ExpressError(404, "Listing Not Found");
    }
    res.redirect("/listings");
  })
);

// Render form to edit
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      throw new ExpressError(404, "Listing Not Found");
    }
    res.render("listings/new", { listing });
  })
);

// FOR REVIEWS
// Create route
app.post(
  "/listing/:id/review",
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review);
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    console.log(`review ${review}`);
    res.redirect(`/listings/${req.params.id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Internal Server Error" } = err;
  console.error(`Error occurred: ${message}, Status code: ${statusCode}`);

  if (res.headersSent) {
    // Check if headers have already been sent, if so, pass to next error handler
    return next(err);
  }

  res.status(statusCode).render("error.ejs", { message });
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

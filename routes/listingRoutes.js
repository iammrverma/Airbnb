const express = require("express");
const Listing = require("../models/listing"); // Model
const ExpressError = require("../utils/ExpressError"); //Custom error class
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js"); // Schema for form validation

const router = express.Router();

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((e) => e.message).join(", ");
    new ExpressError(400, errMsg);
  }
  return next();
};

// Index route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const listings = await Listing.find({});
    res.render("listings/listings", { listings });
  })
);

// Create route
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const { listing } = req.body;

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created !");
    return res.redirect("/listings");
  })
);

// Render create view
router.get("/new", (req, res) => {
  res.render("listings/new", { listing: null });
});

// View route
router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const listing = await Listing.findById(req.params.id).populate("reviews");
    if (!listing) {
      req.flash("error", "Listing Not Found!");
      res.redirect("/listings");
    }
    res.render("listings/listing", { listing });
  })
);

// Update route
router.patch(
  "/:id",
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
    req.flash("success", "Changes Made Successfully !");
    res.redirect(`/listings/${req.params.id}`);
  })
);

// Destroy route
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      req.flash("error", "Listing Not Found!");
      res.redirect("/listings");
    }
    req.flash("success", "Listing Deleted !");

    res.redirect("/listings");
  })
);

// Render form to edit
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing Not Found!");
      res.redirect("/listings");
    }
    res.render("listings/new", { listing });
  })
);

module.exports = router;

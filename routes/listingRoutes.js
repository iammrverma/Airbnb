const express = require("express");
const Listing = require("../models/listing"); // Model
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const router = express.Router();



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
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    const { listing } = req.body;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created !");
    return res.redirect("/listings");
  })
);

// Render create view
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new", { listing: null });
});

// View route
router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const listing = await Listing.findById(req.params.id)
      .populate({path:"reviews", populate:{path:"author"}})
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing Not Found!");
      return res.redirect("/listings");
    }
    res.render("listings/listing", { listing });
  })
);

// Update route
router.patch(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res, next) => {
    const { listing: updatedData } = req.body;
    const { id } = req.params;

    try {
      await Listing.findByIdAndUpdate(id, updatedData, {
        runValidators: true,
      });
    } catch (e) {
      req.flash(
        "error",
        "Some Error in updating the Lisiting please try later"
      );
      return res.redirect("/listings");
    }

    req.flash("success", "Changes Made Successfully !");
    res.redirect(`/listings/${id}`);
  })
);

// Destroy route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
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
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      req.flash("error", "Listing Not Found!");
      return res.redirect("/listings");
    }

    res.render("listings/new", { listing });
  })
);

module.exports = router;

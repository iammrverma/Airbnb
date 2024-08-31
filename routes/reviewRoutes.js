const express = require("express");
const Review = require("../models/review"); //Model
const Listing = require("../models/listing"); //Model
const ExpressError = require("../utils/ExpressError"); //Custom error class
const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js"); // Schema for form validation
const { isLoggedIn, isAuthor } = require("../middleware.js");

const router = express.Router({ mergeParams: true });

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((e) => e.message).join(", ");
    new ExpressError(400, errMsg);
  }
  return next();
};

// Create route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    console.log(`review ${review}`);
    req.flash("success", "Review Added !");
    res.redirect(`/listings/${req.params.id}`);
  })
);

// Delete route
router.delete(
  "/:rId",
  isLoggedIn,
  isAuthor,
  wrapAsync(async (req, res) => {
    const { id, rId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: rId } });
    await Review.findByIdAndDelete(rId);
    req.flash("success", "Review Deleted !");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;

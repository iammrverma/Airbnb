const Listing = require("./models/listing");
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js"); // Schema for form validation
const ExpressError = require("./utils/ExpressError"); //Custom error class

const wrapAsync = require("./utils/wrapAsync");
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "Please login first");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) res.locals.redirectUrl = req.session.redirectUrl;
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "Bad Request! Unauthorised user");
    return res.redirect(`/listings/${req.params.id}`);
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const review = await Review.findById(req.params.rId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "Bad Request! Unauthorised user");
    return res.redirect(`/listings/${req.params.id}`);
  }
  next();
};

module.exports.listingExists = wrapAsync(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing Not Found!");
    return res.redirect("/listings");
  }

  res.locals.listing = listing;
  next();
});

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((e) => e.message).join(", ");
    new ExpressError(400, errMsg);
  }
  return next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((e) => e.message).join(", ");
    new ExpressError(400, errMsg);
  }
  return next();
};

const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const review = new Review(req.body.review);

  review.author = req.user._id;
  listing.reviews.push(review);

  await review.save();
  await listing.save();

  req.flash("success", "Review Added !");
  res.redirect(`/listings/${req.params.id}`);
};

module.exports.destroyReview = async (req, res) => {
  const { id, rId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: rId } });
  await Review.findByIdAndDelete(rId);
  req.flash("success", "Review Deleted !");
  res.redirect(`/listings/${id}`);
};

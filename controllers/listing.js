const Listing = require("../models/listing");
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

module.exports.index = async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/listings", { listings });
};

module.exports.create = async (req, res, next) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "New Listing Created !");
  return res.redirect("/listings");
};

module.exports.newListingForm = (req, res) => {
  res.render("listings/new", { listing: null, BASE_URL });
};

module.exports.editListingForm = async (req, res) => {
  res.render("listings/new", { listing: res.locals.listing, BASE_URL });
};

module.exports.show = async (req, res, next) => {
  res.render("listings/listing", { listing: res.locals.listing, BASE_URL });
};

module.exports.update = async (req, res, next) => {
  const { listing: updatedData } = req.body;
  const { id } = req.params;

  try {
    await Listing.findByIdAndUpdate(id, updatedData, {
      runValidators: true,
    });
  } catch (e) {
    req.flash("error", "Some Error in updating the Lisiting please try later");
    return res.redirect("/listings");
  }

  req.flash("success", "Changes Made Successfully !");
  res.redirect(`/listings/${id}`);
};

module.exports.destroy = async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
  } catch (e) {
    req.flash("error", "Some Error in deleeting the Lisiting please try later");
  }
  res.redirect("/listings");
};

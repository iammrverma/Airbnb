const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const {
  isLoggedIn,
  isOwner,
  validateListing,
  listingExists,
} = require("../middleware.js");
const {
  index,
  show,
  update,
  destroy,
  editListingForm,
  newListingForm,
  create,
} = require("../controllers/listing.js"); // Controller
const router = express.Router();

// Index route
router.get("/", wrapAsync(index));

// Create route
router.post("/", isLoggedIn, validateListing, wrapAsync(create));

// Render create view
router.get("/new", isLoggedIn, newListingForm);

// View route
router.get("/:id", listingExists, wrapAsync(show));

// Update route
router.patch(
  "/:id",
  isLoggedIn,
  isOwner,
  listingExists,
  validateListing,
  wrapAsync(update)
);

// Destroy route
router.delete("/:id", isLoggedIn, isOwner, listingExists, wrapAsync(destroy));

// Render form to edit
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  listingExists,
  wrapAsync(editListingForm)
);

module.exports = router;

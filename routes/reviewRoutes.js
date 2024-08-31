const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isAuthor, validateReview } = require("../middleware.js");
const { createReview, destroyReview } = require("../controllers/reviews.js");

const router = express.Router({ mergeParams: true });

// Create route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(createReview)
);

// Delete route
router.delete(
  "/:rId",
  isLoggedIn,
  isAuthor,
  wrapAsync(destroyReview)
);

module.exports = router;

const express = require("express");
const Listing = require("../models/listing"); // Model
const ExpressError = require("../utils/ExpressError"); //Custom error class
const wrapAsync = require("../utils/wrapAsync.js");
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const router = express.Router();

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((e) => e.message).join(", ");
    new ExpressError(400, errMsg);
  }
  return next();
};

router.get("/signup", (req, res) => {
  res.render("users/signup");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const user = await User.register(newUser, password);

      req.login(user, (err) => {
        if (err) return next(err);
        req.flash("success", "registered");
        res.redirect("/listings");
      });

    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  wrapAsync(async (req, res) => {
    const { username, password } = req.body;
    req.flash("success", "Welcome Back ");
    const redirectUrl = res.locals.redirectUrl ||"/listings";
    res.redirect(redirectUrl);
  })
);

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) {
      return next();
    }
    req.flash("success", "Logged Out ");
    res.redirect("/listings");
  });
});

module.exports = router;

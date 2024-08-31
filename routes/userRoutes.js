const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const {
  signup,
  renderSignupForm,
  renderLoginForm,
  login,
  logout,
} = require("../controllers/users.js");

const router = express.Router();

router.route("/signup").get(renderSignupForm).post(wrapAsync(signup));

router
  .route("/login")
  .get(renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    wrapAsync(login)
  );

router.get("/logout", logout);

module.exports = router;

const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup");
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

module.exports.signup = async (req, res) => {
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
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome Back ");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logOut((err) => {
    if (err) {
      return next();
    }
    req.flash("success", "Logged Out ");
    res.redirect("/listings");
  });
};

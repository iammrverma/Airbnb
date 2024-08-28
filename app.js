const express = require("express");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");

const ExpressError = require("./utils/ExpressError.js"); //Custom error class
const listingRoute = require("./routes/listingRoutes.js");
const reviewRoute = require("./routes/reviewRoutes.js");

const app = express();

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017/airbnb";

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"], // Allow scripts from self and cdn.jsdelivr.net
        imgSrc: ["'self'", "https://images.unsplash.com", "data:"], // Allow images from self, Unsplash, and data URIs
        // Add other directives as needed
      },
    },
  })
);

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Routes
app.get("/", (req, res) => res.send("Welcome!!!"));
app.use("/listings", listingRoute);
app.use("/listing/:id/review", reviewRoute);
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Internal Server Error" } = err;
  console.error(`Error occurred: ${message}, Status code: ${statusCode}`);
  if (res.headersSent) {
    // Check if headers have already been sent, if so, pass to next error handler
    return next(err);
  }
  res.status(statusCode).render("error.ejs", { message });
});

// Connect to the database and start the server
async function main(dbUrl) {
  try {
    await mongoose.connect(dbUrl); // No need for useNewUrlParser or useUnifiedTopology
    console.log("Connected to database");
    app.listen(PORT, () => {
      console.log(`App listening at PORT ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1); // Exit process with failure
  }
}

main(DB_URL);

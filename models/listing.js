const mongoose = require("mongoose");

const listningSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: {
    filename: String,
    url: {
      type: String,
      default:
        "https://www.istockphoto.com/photo/the-blank-stare-of-a-childs-eye-who-is-standing-behind-what-appears-to-be-a-wooden-gm1181265061-331247858?utm_campaign=srp_photos_top&utm_content=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2Fnot-found&utm_medium=affiliate&utm_source=unsplash&utm_term=not+found%3A%3A%3A",
      set: (v) =>
        v === ""
          ? "https://www.istockphoto.com/photo/the-blank-stare-of-a-childs-eye-who-is-standing-behind-what-appears-to-be-a-wooden-gm1181265061-331247858?utm_campaign=srp_photos_top&utm_content=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2Fnot-found&utm_medium=affiliate&utm_source=unsplash&utm_term=not+found%3A%3A%3A"
          : v,
    },
  },
  price: { type: Number },
  location: { type: String },
  country: { type: String },
});

const Listning = mongoose.model("Listning", listningSchema);

module.exports = Listning;

const mongoose = require("mongoose");

const listningSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: {
    filename: String,
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1470165301023-58dab8118cc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1470165301023-58dab8118cc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60"
          : v,
    },
  },
  price: { type: Number },
  location: { type: String },
  country: { type: String },
});

const Listning = mongoose.model("Listning", listningSchema);

module.exports = Listning;

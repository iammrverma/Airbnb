const mongoose = require("mongoose");
const pasportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

userSchema.plugin(pasportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;

const mongoose = require("mongoose");
const data = require("./data");
const Listning = require("../models/listing");
const DB_URL = "mongodb://127.0.0.1:27017/airbnb";

const main = async (url) => await mongoose.connect(url);

main(DB_URL)
  .then(() => console.log("connected to database"))
  .catch((err) => console.log(err));

const initDatabase = async () => {
  await Listning.deleteMany({});
  await Listning.insertMany(data.data);
  console.log("database initialised");
};

initDatabase();

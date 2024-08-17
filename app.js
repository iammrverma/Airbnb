const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const methodOverride = require("method-override");
const path = require("path");

const Listning = require("./models/listing");
const app = express();

const PORT = 3000;
const DB_URL = 'mongodb://127.0.0.1:27017/airbnb';

const main = async (url) => await mongoose.connect(url);

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set('view engine', path.join(__dirname, "views"));
app.get("/", (req, res) => res.send("Welcome!!!"));

app.get("/test", async (req, res) =>{
    let sample = new Listning({
        title:"hello world",
        description:"hello world",
        price:120000,
        location:"heaven",
        country:"India"
    });
    await sample.save();
    console.log('saved');
    res.send("saved");
    
});


app.listen(PORT, () => console.log(`app.listneing at PORT ${PORT}`));
main(DB_URL).then(() => console.log("connected to database")).catch(err => console.log(err));

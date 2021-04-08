var express = require("express");
var app = express();
var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/Voltron');
var createError = require("http-errors");

var Session = require("./schema/Session");
const currentSession = new Session();

// var Point = require("./schema/Point");


app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "POST, GET");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.get("/test", (req, res) => {
//   res
//     .status(200)
//     .json({
//       title: "Test Working",
//       body: "the template is good so far",
//     })
//     .send();
// });

app.post("/initialize", (req, res) => {

  currentSession.initialVoltage = 100;
  currentSession.save();

  res
    .status(200)
    .send(currentSession);
});

app.get("/currentSession", (req, res) => {
  if (currentSession !== null) {
    res.status(200).send(currentSession._id);
  } else {
    res.status(500).send("Current Session has not been initialized."); //edge case that should never execute
  }
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.listen(5000, function () {
  console.log("Voltron API running on port 5000...");
});

module.exports = app;

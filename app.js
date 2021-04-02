var express = require('express');
var app = express();
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/swag-shop');
var createError = require('http-errors');

var Session = require('./schema/Session');
var Point = require('./schema/Point');

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  next(createError(404));
});

app.listen(5000, function() {
    console.log("Voltron API running on port 5000...");
});

module.exports = app;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var point = new Schema({
    time: String,
    day: String,
    initialVoltage: Number,
});

module.exports = mongoose.model('Point', point);
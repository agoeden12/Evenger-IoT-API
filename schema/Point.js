var mongoose = require('mongoose'), Schema = mongoose.Schema;
var date = new Date();
var day = date.toLocaleDateString("en-US", {timeZone: "America/New_York"});
var time = date.toLocaleTimeString("en-US", { hour12: false });

var point = new Schema({
    day: {type: String, default: day},
    time: {type: String, default: time},
    voltage: {type: Number, required: true},
    batteryTemp: {type: Number, required: true},
    motorControllerTemp: {type: Number, required: true}
});

module.exports = mongoose.model('Point', point);
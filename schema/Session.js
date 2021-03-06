const mongoose = require('mongoose'), Schema = mongoose.Schema;
var date = new Date();
var day = date.toLocaleDateString("en-US", {timeZone: "America/New_York"});
var time = date.toLocaleTimeString("en-US", { hour12: false });

// This is the schema to properly structure the data for each session to prevent any data corruption or inconsistencies
var session = new Schema({
    date: {type: Date, default: date},
    startDay: {type: String, default: day},
    startTime: {type: String, default: time},
    initialVoltage: {type: Number, required: true},
    data: [{ type: Schema.Types.ObjectId, ref: 'Point' }]
});

module.exports = mongoose.model('Session', session);
const mongoose = require('mongoose'), Schema = mongoose.Schema;
// const date = new Date();
// const day = date.toLocaleDateString("en-US", {timeZone: "America/New_York"});
// const time = date.toLocaleTimeString("en-US", { hour12: false });

// console.log(date);
// console.log(day);
// console.log(time);

var session = new Schema({
    date: Date,
    startDay: String,
    startTime: String,
    initialVoltage: Number,
    data: [{ type: Schema.Types.ObjectId, ref: 'Point' }]
});

module.exports = mongoose.model('Session', session);
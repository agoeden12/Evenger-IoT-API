var mongoose = require('mongoose'), Schema = mongoose.Schema;

// This is the schema to properly structure the data for each data point to prevent any data corruption or inconsistencies
var point = new Schema({
    day: {type: String, required: true},
    time: {type: String, required: true},
    voltage: {type: Number, required: true},
    current: {type: Number, required: true},
    highestCell: {type: Number, required: true},
    lowestCell: {type: Number, required: true},
    averageCell: {type: Number, required: true},
    batteryTemp: {type: Number, required: false},
    motorControllerTemp: {type: Number, required: false}
});

module.exports = mongoose.model('Point', point);
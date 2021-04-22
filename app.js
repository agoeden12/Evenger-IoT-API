var express = require("express");
var app = express();
var expressWs = require("express-ws")(app);
var evengerSocket = expressWs.getWss();

var createError = require("http-errors");
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/evenger", {useNewUrlParser: true, useUnifiedTopology: true});

var Point = require("./schema/Point");
var Session = require("./schema/Session");
const currentSession = new Session();

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

app.post("/initialize", (req, res) => {
  currentSession.initialVoltage = req.body.initialVoltage;
  currentSession.save();

  res.status(200).send(currentSession);
});

app.get("/currentSession", (req, res) => {
  if (currentSession !== null) {
    res.status(200).send(currentSession._id);
  } else {
    res.status(500).send("Current Session has not been initialized."); //edge case that should never execute
  }
});

// evengerSocket.on("connection", () => {
//   console.log("connected");
// })

app.ws("/point", function (ws) {
  ws.on("message", (msg) => {
    if (addPoint(JSON.parse(msg))) {
      evengerSocket.clients.forEach((client) => {
        client.send(msg);
      });
    }
  });
});

app.use(function (req, res, next) {
  next(createError(404));
});

function addPoint(body) {
  var point = new Point({
    voltage: body.voltage,
    current: body.current,
    highestCell: body.highestCell,
    lowestCell: body.lowestCell,
    averageCell: body.averageCell,
  });

  const error = point.validateSync();
  if (error) {
    console.log(error);
    return false;
  } else {
    currentSession.data.push(point);
    currentSession.save().then(result => {
    }).catch((err) => {
      // console.log(err);
    });
    return true;
  }
}

app.listen(5000, function () {
  console.log("Voltron API running on port 5000...");
});

module.exports = app;

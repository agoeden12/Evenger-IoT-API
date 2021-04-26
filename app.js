var express = require("express");
var app = express();
var expressWs = require("express-ws")(app);
var evengerSocket = expressWs.getWss();

var createError = require("http-errors");
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/evenger", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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

app.get("/sessionPoints", (req, res) => {
  res.status(200).send(currentSession.data)
})

app.ws("/point", function (ws) {
  ws.on("message", async (msg) => {
    await addPoint(JSON.parse(msg)).then((point) => {
      evengerSocket.clients.forEach((client) => {
        client.send(JSON.stringify(point));
      });
    });
  });
});

app.use(function (req, res, next) {
  next(createError(404));
});

async function addPoint(body) {
  var date = new Date();
  var day = date.toLocaleDateString("en-US", { timeZone: "America/New_York" });
  var time = date.toLocaleTimeString("en-US", { hour12: false });

  var point = new Point({
    day: day,
    time: time,
    voltage: body.voltage,
    current: body.current,
    highestCell: body.highestCell,
    lowestCell: body.lowestCell,
    averageCell: body.averageCell,
  });

  const error = point.validateSync();
  if (error) {
    console.log(error);
    return body;
  } else {
    currentSession.data.push(point);
    currentSession.save().catch((err) => {
      // console.log(err);
    });
    return point;
  }
}

app.listen(5000, "0.0.0.0", function () {
  console.log("Voltron API running on port 5000...");
});

module.exports = app;

// Create the Express variables and create the API app object
var express = require("express");
var app = express();
var expressWs = require("express-ws")(app);
var evengerSocket = expressWs.getWss();
var createError = require("http-errors");

// Connect to the Mongo DB database using the Mongoose library
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/evenger", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import the required schemas for the database objects to enforce data consistency
var Point = require("./schema/Point");
var Session = require("./schema/Session");
const currentSession = new Session();

// Set global connection requirements and parameters
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

// This is called by the python script to create the session
app.post("/initialize", (req, res) => {
  currentSession.initialVoltage = req.body.initialVoltage;
  currentSession.save();

  res.status(200).send(currentSession);
});

// Used for testing to ensure consistent session data
app.get("/currentSession", (req, res) => {
  if (currentSession !== null) {
    res.status(200).send(currentSession._id);
  } else {
    res.status(500).send("Current Session has not been initialized."); //edge case that should never execute
  }
});

// Used by the client to sync data and prevent inaccurate displaying of data points
app.get("/sessionPoints", (req, res) => {
  res.status(200).send(currentSession.data)
})

// Web Socket that receives messages from the Low-Level system and then adds the data points to the database before sending the messages to the client.
app.ws("/point", function (ws) {
  ws.on("message", async (msg) => {
    // Waits for a data point to be verified and added to the database before sending data to the client
    await addPoint(JSON.parse(msg)).then((point) => {

      // Send the data to all listening clients, this causes the Client to not need to request anything once synced
      evengerSocket.clients.forEach((client) => {

        // Web Sockets do not use JSON objects for transferring the data, so the data is formatted as a string to for easy parsing
        client.send(JSON.stringify(point));
      });
    });
  });
});

// Extra function to return 404 status if an endpoint is provided but nothing was configured for it
app.use(function (req, res, next) {
  next(createError(404));
});

// Taking in a message from the Low-Level system and correctly processing for the database and client
async function addPoint(body) {
  var date = new Date();
  var day = date.toLocaleDateString("en-US", { timeZone: "America/New_York" });
  var time = date.toLocaleTimeString("en-US", { hour12: false });

  // Format the message according to the point schema
  var point = new Point({
    day: day,
    time: time,
    voltage: body.voltage,
    current: body.current,
    highestCell: body.highestCell,
    lowestCell: body.lowestCell,
    averageCell: body.averageCell,
  });

  // Validate the point schema is correct to prevent corruptions
  const error = point.validateSync();
  if (error) {
    console.log(error);
    return body;
  } else {

    // If the point is valid then save it to the current session and return the point to be sent to the client
    currentSession.data.push(point);
    currentSession.save().catch((err) => {
      // console.log(err);
    });
    return point;
  }
}

// Set the middleware to listen on port 5050 on localhost and from within the current network
app.listen(5000, "0.0.0.0", function () {
  console.log("Voltron API running on port 5000...");
});

module.exports = app;

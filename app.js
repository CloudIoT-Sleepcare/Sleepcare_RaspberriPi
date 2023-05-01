var express = require("express");
var router = express.Router();
var sensorLib = require("node-dht-sensor");

var sensor = {
  initialize: function () {
    return sensorLib.initialize(11, 24);
  },
  read: function () {
    var readout = sensorLib.read();
    setTimeout(function () {
      sensor.read();
    }, 1500);

    return readout;
  },
};

/* GET users listing. */
router.get("/", function (req, res, next) {
  var readout;
  if (sensor.initialize()) {
    readout = sensor.read();
  }
  res.setHeader("Content-Type", "application/json");
  res.json(readout);
});
module.exports = router;

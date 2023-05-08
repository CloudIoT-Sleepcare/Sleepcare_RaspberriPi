const gpio = require("node-wiring-pi");
const LIGHT = 7;

const CheckLight = function () {
  let data = gpio.digitalRead(LIGHT);
  console.log(data);
  setTimeout(CheckLight, 200);
};
setTimeout(CheckLight, 200);

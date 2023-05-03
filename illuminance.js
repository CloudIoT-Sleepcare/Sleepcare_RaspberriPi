const gpio = require("node-wiring-pi");
const LIGHT = 7;
const LED = 25;

const CheckLight = function () {
  gpio.digitalWrite(LED, 0);
  let data = gpio.digitalRead(LIGHT);
  if (!data) {
    console.log("Bright!!");
    gpio.digitalWrite(LED, 0);
  } else {
    console.log("Dark!!");
    gpio.digitalWrite(LED, 1);
  }
  setTimeout(CheckLight, 500);
};

process.on("SIGINT", function () {
  gpio.digitalWrite(LED, 0);
  console.log("exit");
  process.exit();
});

gpio.setup("wpi");
gpio.pinMode(LED, gpio.OUTPUT);
gpio.pinMode(LIGHT, gpio.INPUT);
setTimeout(CheckLight, 200);

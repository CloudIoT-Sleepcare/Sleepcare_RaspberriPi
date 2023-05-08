const Gpio = require("pigpio").Gpio;
const Spi = require("spi-device");

const mcp3008 = Spi.openSync(0, 0, {
  mode: Spi.MODE0,
  maxSpeedHz: 1350000,
});

const adcChannel = 0;
const VCC = 3.3;

function readMcp3008(channel) {
  const message = [
    {
      sendBuffer: Buffer.from([1, (8 + channel) << 4, 0]),
      receiveBuffer: Buffer.alloc(3),
      byteLength: 3,
      speedHz: 1350000,
    },
  ];

  mcp3008.transferSync(message);

  const rawValue =
    ((message[0].receiveBuffer[1] & 3) << 8) + message[0].receiveBuffer[2];

  return (VCC * rawValue) / 1023;
}

const cds5Pin = new Gpio(17, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_UP,
  edge: Gpio.FALLING_EDGE,
  alert: true,
});

setInterval(() => {
  const cds5Val = readMcp3008(adcChannel);
  console.log("CDS-5 val: ", cds5Val);
}, 3000);

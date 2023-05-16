var sensorLib = require("node-dht-sensor");
const Spi = require("spi-device");
const mqtt = require("mqtt");
const options = {
  host: "3.35.41.124", // 브로커 주소
  port: 1883, // 포트
};
const client = mqtt.connect(options);
const template = {
  userId: "BJRVPH",
  datetime: "",
  temperature: "",
  humidity: "",
  illuminance: "",
};

//구독 시 받는 데이터
client.subscribe("test");
client.on("message", function (topic, message) {
  console.log(`토픽:${topic.toString()}, 메세지:${message.toString()}`);
});

const mcp3008 = Spi.openSync(0, 0, {
  mode: Spi.MODE0,
  maxSpeedHz: 1350000,
});

const adcChannel = 0;
const VCC = 1023;

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

var sensor = {
  initialize: function () {
    return sensorLib.initialize(22, 4);
  },
  read: function () {
    var readout = sensorLib.read();
    const cds5Val = readMcp3008(adcChannel);

    template.humidity = readout.humidity.toFixed(2);
    template.temperature = readout.temperature.toFixed(2);
    template.illuminance = cds5Val;
  },
};

setInterval(() => {
  if (sensor.initialize()) {
    sensor.read();
  } else {
    console.warn("Failed to initialize sensor");
  }
  template.datetime = new Date().toISOString();
  var templateJSON = JSON.stringify(template);

  client.publish("test", templateJSON, { qos: 2 });
  console.log("send complete " + templateJSON);
}, 3000);

// var sensorLib = require("node-dht-sensor");
const mqtt = require("mqtt");
const options = {
  host: "3.35.41.124", // 브로커 주소
  port: 1883, // 포트
};

const client = mqtt.connect(options);
const template = {
  datetime: "",
  temperature: "",
  humidity: "",
  illuminance: "",
};

// var sensor = {
//   initialize: function () {
//     return sensorLib.initialize(11, 4);
//   },
//   read: function () {
//     var readout = sensorLib.read();
//     console.log(
//       "Temperature: " +
//         readout.temperature.toFixed(2) +
//         "C, humidity: " +
//         readout.humidity.toFixed(2) +
//         "%" +
//         readout.illuminance.toFixed(2)
//     );
//     setTimeout(function () {
//       sensor.read();
//     }, 1500);
//   },
// };
var templateSetting = function () {
  template.time = new Date().toISOString();
  template.humidity = Math.floor(Math.random() * 30);
  template.temperature = Math.floor(Math.random() * 30);
  template.illuminance = Math.floor(Math.random() * 100);

  // template.humidity = readout.humidity.toFixed(2);
  // template.temperature = readout.temperature.toFixed(2);
  // template.illuminance = readout.illuminance.toFixed(2);
};

//구독 시 받는 데이터
client.subscribe("test");
client.on("message", function (topic, message) {
  console.log(`토픽:${topic.toString()}, 메세지:${message.toString()}`);
});
setInterval(() => {
  // if (sensor.initialize()) {
  //   sensor.read();
  //   templateSetting();
  // } else {
  //   console.warn("Failed to initialize sensor");
  // }

  templateSetting();
  var templateJSON = JSON.stringify(template);

  client.publish("test", templateJSON, { qos: 2 });
  console.log("send complete " + templateJSON);
}, 2000);

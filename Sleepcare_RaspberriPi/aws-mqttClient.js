var awsIot = require("aws-iot-device-sdk");
var sensorLib = require("node-dht-sensor");
var Spi = require("spi-device");

const template = {
  userId: "BJRVPH",
  datetime: "",
  temperature: "",
  humidity: "",
  illuminance: "",
};

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

// // AWS IoT Core 연결 정보
const certPath = "cert/";
const iotEndpoint = "aw8j5acz8wdeu-ats.iot.ap-northeast-2.amazonaws.com"; // AWS IoT Core 엔드포인트 주소
const privateKeyPath = certPath + "Sleepcare.private1.key"; // 라즈베리 파이의 개인 키 경로
const clientCertificatePath = certPath + "Sleepcare.cert1.pem"; // 라즈베리 파이의 인증서 경로
const caCertificatePath = certPath + "root-CA1.crt"; // Root CA 인증서 경로
const clientId = "Sleepcare_RaspberriPi"; // 클라이언트 ID (원하는 값으로 변경)

var device = awsIot.device({
  keyPath: privateKeyPath,
  certPath: clientCertificatePath,
  caPath: caCertificatePath,
  clientId: clientId,
  host: iotEndpoint,
  region: "ap-northeast-2",
});

device.on("connect", function () {
  setInterval(function () {
    console.log("connected to AWS IoT.");
    if (sensor.initialize()) {
      sensor.read();
    } else {
      console.warn("Failed to initialize sensor");
    }
    template.datetime = new Date().toISOString();
    var templateJSON = JSON.stringify(template);
    // random 10 - 35

    device.publish("test", JSON.stringify(templateJSON));
    console.log("sent: ", JSON.stringify(templateJSON));
  }, 1000);
});

console.log("Sensor publisher started.");

// class IOTClient {
//   connect() {
//     return new Promise((resolve, reject) => {
//       this.device = awsIot.device({
//         keyPath: privateKeyPath,
//         certPath: clientCertificatePath,
//         caPath: caCertificatePath,
//         clientId: clientId,
//         host: iotEndpoint,
//         region: "ap-northeast-2",
//       });

//       this.device.on("connect", () => {
//         console.log("Connected to AWS IoT");
//         resolve();
//       });
//       this.device.on("error", (error) => {
//         console.log("error", error);
//       });
//       this.device.on("reconnect", () => {
//         console.log("reconnect");
//       });
//       this.device.on("offline", () => {
//         console.log("offline");
//       });
//     });
//   }

//   subscribe(topic, options, listenerFunction, caller) {
//     this.device.subscribe(topic, options, () => {
//       console.log("Subscribed: " + topic);
//       this.device.on("message", (topic, payload) => {
//         listenerFunction(topic, payload, caller);
//       });
//     });
//   }

//   publish(topic, message, options) {
//     this.device.publish(topic, message, options, (err) => {
//       if (!err) {
//         console.log("published successfully: " + topic);
//       } else {
//         console.log(err);
//       }
//     });
//   }

//   disconnect() {
//     this.device.end();
//   }
// }

// var client = new IOTClient();

// const template = {
//   userId: "BJRVPH",
//   datetime: "",
//   temperature: "",
//   humidity: "",
//   illuminance: "",
// };

// const mcp3008 = Spi.openSync(0, 0, {
//   mode: Spi.MODE0,
//   maxSpeedHz: 1350000,
// });
// const adcChannel = 0;
// const VCC = 1023;
// function readMcp3008(channel) {
//   const message = [
//     {
//       sendBuffer: Buffer.from([1, (8 + channel) << 4, 0]),
//       receiveBuffer: Buffer.alloc(3),
//       byteLength: 3,
//       speedHz: 1350000,
//     },
//   ];

//   mcp3008.transferSync(message);

//   const rawValue =
//     ((message[0].receiveBuffer[1] & 3) << 8) + message[0].receiveBuffer[2];

//   return (VCC * rawValue) / 1023;
// }
// var sensor = {
//   initialize: function () {
//     return sensorLib.initialize(22, 4);
//   },
//   read: function () {
//     var readout = sensorLib.read();
//     const cds5Val = readMcp3008(adcChannel);

//     template.humidity = readout.humidity.toFixed(2);
//     template.temperature = readout.temperature.toFixed(2);
//     template.illuminance = cds5Val;
//   },
// };
// client.connect().then(() => {
//   client.subscribe("test", {}, (topic, payload, caller) => {
//     console.log(`토픽:${topic.toString()}, 메세지:${payload.toString()}`);
//   });

//   setInterval(() => {
//     if (sensor.initialize()) {
//       sensor.read();
//     } else {
//       console.warn("Failed to initialize sensor");
//     }
//     template.datetime = new Date().toISOString();
//     var templateJSON = JSON.stringify(template);
//     client.publish("test", templateJSON, { qos: 2 });
//   }, 1000);
// });

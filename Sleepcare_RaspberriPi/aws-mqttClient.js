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
    template.datetime = new Date();
    template.datetime.setUTCHours(template.datetime.getUTCHours() + 9);

    var templateJSON = JSON.stringify(template);

    device.publish("env", templateJSON);
    console.log("sent: ", templateJSON);
  }, 5 * 60 * 1000);
});

console.log("Sensor publisher started.");

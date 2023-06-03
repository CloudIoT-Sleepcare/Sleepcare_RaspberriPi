const awsIot = require("aws-iot-device-sdk");

// AWS IoT Core 연결 정보
const iotEndpoint = "aw8j5acz8wdeu-ats.iot.ap-northeast-2.amazonaws.com"; // AWS IoT Core 엔드포인트 주소
const certPath = "/home/pi/Sleepcare_RaspberriPi/cert/";
const privateKeyPath = certPath + "SleepCare.private.key"; // 라즈베리 파이의 개인 키 경로
const clientCertificatePath = certPath + "SleepCare.cert.pem"; // 라즈베리 파이의 인증서 경로
const caCertificatePath = certPath + "root-CA.crt"; // Root CA 인증서 경로
const clientId = "Hanju Kim"; // 클라이언트 ID (원하는 값으로 변경)

// MQTT 클라이언트 초기화
const device = awsIot.device({
  privateKey: fs.readFileSync(privateKeyPath),
  clientCert: fs.readFileSync(clientCertificatePath),
  caCert: fs.readFileSync(caCertificatePath),
  clientId: clientId,
  host: iotEndpoint,
});

// MQTT 연결 완료 이벤트 핸들러
device.on("connect", () => {
  console.log("Connected to AWS IoT Core");

  // 메시지 게시
  const topic = "your-topic"; // 게시할 토픽 (원하는 값으로 변경)
  const message = "Hello, IoT Core!"; // 보낼 메시지 (원하는 값으로 변경)
  device.publish(topic, message);
  console.log("Published message:", message);
});

// MQTT 연결 에러 이벤트 핸들러
device.on("error", (error) => {
  console.error("Error:", error);
});

// MQTT 연결 끊김 이벤트 핸들러
device.on("close", () => {
  console.log("Connection to AWS IoT Core closed");
});

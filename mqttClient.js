const mqtt = require("mqtt");
const options = {
  host: "127.0.0.1", // 브로커 주소
  port: 8883, // 포트
  protocol: "mqtts", // 프로토콜
  username: "steve", // 계정
  password: "password", // 비밀번호
};

const client = mqtt.connect("mqtt://test.mosquitto.org");
const book = {
  title: "Ego is the Enemy",
  author: "Ryan Holiday",
};
const bookJSON = JSON.stringify(book);
console.log(bookJSON);
client.subscribe("test");
client.on("message", function (topic, message) {
  console.log(`토픽:${topic.toString()}, 메세지:${message.toString()}`);
});

setInterval(() => {
  client.publish("test", bookJSON, { qos: 2 });
}, 2000);

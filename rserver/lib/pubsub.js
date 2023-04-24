let redis = require('./redis');
const sm = require("./socket_manager");
const ut = require("./utils");

subscribeToPubSub = async (channels, _socket) => {
  // Connect to redis and subscribe on channels
  const subscriber = redis.client.duplicate();
  await subscriber.connect();
  _socket.subscriber = subscriber;

  console.log("Subscribing...");
  ut.sendToSocket(`Subscribing to channels on Redis ${channels}`, _socket);
  subscriber.subscribe(channels, (redis_message, channel) => {
    let message = JSON.parse(redis_message);
    let send_message = `Subscription message: ${channel} - ${message.type} - ${message.sender} - ${redis_message}`;
    ut.sendToSocket(send_message, _socket);
  });

  // Create Producer to Send - We can only one producer but will it choke?
  // producer = client.duplicate();
  // await producer.connect();
  // socket.producer = producer;
};

module.exports = {
    subscribeToPubSub
}
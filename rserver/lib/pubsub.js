const { Console } = require('console');
let redis = require('./redis');
const sm = require("./socket_manager");
const ut = require("./utils");

subscribeToPubSub = async (channels, _socket) => {
  // Connect to redis and subscribe on channels
  const subscriber = redis.client.duplicate();
  await subscriber.connect();
  _socket.subscriber = subscriber;

  console.log("Subscribing...");
     const post_message  = {
            type: "channel-subscription",
            ///mtype,
            messageText: `Subscribing to channels on Redis ${channels}`,
            sender: "server",
            channel: "General"
        };

  ut.sendToSocket(JSON.stringify(post_message), _socket);
  subscriber.subscribe(channels, (redis_message, channel) => {
     try {
    console.log("redis msg: " + redis_message);
    let message = JSON.parse(redis_message);
    let send_message = `Subscription message: ${channel} - ${message.type} - ${message.sender} - ${redis_message}`;

    let post_message  = {
            type: "redis-msg",
            ///mtype,
            messageText:send_message,
            sender: "server",
            channel: "General"
        };
///console.log("redis msg..." + JSON.stringify(post_message));
    ut.sendToSocket(JSON.stringify(post_message),  _socket);
      } catch (e) {
      console.log("EXCEPTION: " + e.message);
  }
  });

  // Create Producer to Send - We can only one producer but will it choke?
  // producer = client.duplicate();
  // await producer.connect();
  // socket.producer = producer;
};

module.exports = {
    subscribeToPubSub
}
const { Console } = require("console");
let redis = require("./redis");
const ut = require("./utils");

// current server shall hold instance of redis client ..
// to communciate with other servers - thru redis..
// probably, redis may poll the server once in a  while!
const serverSubscriber = redis.client.duplicate();
serverSubscriber.connect();

const serverProducer = redis.client.duplicate();
serverProducer.connect();

// this is the server (application) ID
var serverID = process.env.SERVER_ID;

let serverSubscribeToRedis = async () => {
  console.log(`Server ${serverID} Subscribing...`);

  // current server shall intimate other servers
  // this indicates: Activation status of current server
  const post_server_message = {
    type: "server-subscription-activated",
    ///mtype,
    messageText: `Server-${serverID} Subscribing on Redis`,
    sender: `Server-${serverID}`,
    channel: "server-channel",
  };

  // publsihing the server messgae to listeners
  serverProducer.publish(
    post_server_message.channel,
    JSON.stringify(post_server_message)
  );

  // then, current server subscribes to server-channel for messages from other servers
  // probable message types: server-subscription-activated, server-subscription-XYZ
  serverSubscriber.subscribe("server-channel", (server_message, channel) => {
    try {
      let message = JSON.parse(server_message);

      // only if sender is not the current one..
      if (message.sender != `Server-${serverID}`) {
        console.log("Message From <SOME> server: " + server_message);
        // based on message type..
        // we can delegate to other functionaries..
        //
      }
    } catch (e) {
      console.log("EXCEPTION: " + e.message);
    }
  });
};

// Create Producer to Send - We can only one producer but will it choke?
// producer = client.duplicate();
// await producer.connect();
// socket.producer = producer;
let x = async () => {};
let subscribeToPubSub = async (channels, _socket) => {
  // Connect to redis and subscribe on channels
  const subscriber = redis.client.duplicate();
  await subscriber.connect();
  _socket.subscriber = subscriber;

  console.log("Subscribing...");
  const post_message = {
    type: "channel-subscription",
    ///mtype,
    messageText: `Subscribing to channels on Redis ${channels}`,
    sender: "server",
    channel: "General",
  };

  ut.sendToSocket(JSON.stringify(post_message), _socket);
  subscriber.subscribe(channels, (redis_message, channel) => {
    try {
      console.log("redis msg: " + redis_message);
      let message = JSON.parse(redis_message);
      let send_message = `Subscription message: ${channel} - ${message.type} - ${message.sender} - ${redis_message}`;

      let post_message = {
        type: "redis-msg",
        ///mtype,
        messageText: send_message,
        sender: "server",
        channel: "General",
      };
      ///console.log("redis msg..." + JSON.stringify(post_message));
      ut.sendToSocket(JSON.stringify(post_message), _socket);
    } catch (e) {
      console.log("EXCEPTION: " + e.message);
    }
  });
};

module.exports = {
  subscribeToPubSub,
  x,
  serverSubscribeToRedis,
  serverSubscriber,
  serverProducer,
};

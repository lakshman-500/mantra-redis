const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const EventEmitter = require("events");
const redis = require("./redis");
let pubsub = require("./pubsub");
let _channel = require("./channels");

const sm = require("./socket_manager");

const emits = new EventEmitter();

var serverID = process.env.SERVER_ID;

const io = new Server(server, {
  cors: {
    origin: "*",
    /// "http://localhost:*",
  },
});

// clear all keys of given server!! - to verify this function..
redis.deleteAllKeys(process.env.SERVER_ID);

try {
  // open a JSON Document  with serverid as the key..
  redis.client.json.set(process.env.SERVER_ID, "$", {});
} catch (e) {
  console.log(" ERROR SETTING REDIS KEY PATH " + e);
  /** handle the following...
   * key not found?
   * path not found?
   * status invalid?
   * client invalid?
   * or json module problem?
   * or redis itself is wrong?
   */
  // await redis.client.json.set(key, "$", {});
  // await redis.client.json.set(key, path, userStatus);
}

// flag to hold if the server is properly registerred
var serverReady = false;

//let channels = await _channel.getChannels(tokenID);
// server should subscribe with Redis..

pubsub.serverSubscribeToRedis();

const RUN_EVERY_X_SECS = 60 * 10;
/// continuously run this for every RUN_EVERY_X_SECS
setInterval(() => {
  console.log("can Send Alive msg? " + serverReady);
  if (serverReady) {
    console.log("Ready to Send alive message...");
    // current server shall intimate other servers
    // this indicates: Activation status of current server
    const post_server_alive_message = {
      type: "server-subscription-alive",
      ///mtype,
      messageText: `Server-${serverID} is live`,
      sender: `Server-${serverID}`,
      channel: "server-channel",
    };

    // publsihing the server messgae to listeners
    pubsub.serverProducer.publish(
      post_server_alive_message.channel,
      JSON.stringify(post_server_alive_message)
    );
    console.log("Sent alive message!");
  }
}, 1000 * RUN_EVERY_X_SECS);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  sm.addConnection(socket);
});

server.close((err) => {
  console.log("server stopped");
});
console.log("server id: ---------------------" + process.env.SERVER_PORT);
server.listen(process.env.SERVER_PORT, () => {
  console.log(`listening on *:${process.env.SERVER_PORT}}`);
  // now the server registration is complete
  serverReady = true;
});

module.exports = server;

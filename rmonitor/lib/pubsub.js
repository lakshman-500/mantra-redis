const { Console, error } = require("console");
let redis = require("./redis");
const ut = require("./utils");

// this is the server (application) ID
var serverID = process.env.SERVER_ID;

// current server shall hold instance of redis client ..
// to communciate with other servers - thru redis..
// probably, redis may poll the server once in a  while!
const serverSubscriber = redis.client.duplicate();

// a handler for subscriber
serverSubscriber.connect();

// a handle for producer
const serverProducer = redis.client.duplicate();
serverProducer.connect();

let servers = [];

let serverSubscribeToRedis = async () => {
  console.log(`Server Monitor ${serverID} Subscribing...`);
  // when a server joins server channel..
  // add to servers list..
  serverSubscriber.subscribe("server-channel", (server_message, channel) => {
    try {
      let message = JSON.parse(server_message);

      console.log(`${message.sender} versus Server-${serverID}`);
      //  if (message.sender != `Server-${serverID}`) {
      if (message.sender != `${serverID}`) {
        // only if sender is not the current one..
        console.log("Message From <SOME> server: " + server_message);
        // based on message type..
        // we can delegate to other functionaries..
        //
        var sf = servers.filter(function (v, i, a) {
          console.log(`${message.sender} versus Server-${a[i].sender}`);
          return message.sender != a[i].sender;
        });
        if (sf.length == 0) {
          servers.push(message.sender);
          console.log(`server ${message.sender}  added to list`);
        } else {
          console.log("Server is already added to the monitor list.");
        }
      } else {
        console.log("No need to add monitor as listener to the channel.");
      }
    } catch (e) {
      console.log("EXCEPTION: " + e.message);
    }
  });
};

let sendSubscriptionUpdateToOtherServers = async () => {
  // current server shall intimate other servers
  // this indicates: Activation status of current server
  const post_server_message = {
    type: "server-subscription-update",
    ///mtype,
    messageText: `Updated Servers List`,
    sender: `Server-Monitor`,
    channel: "server-channel",
  };
  // publsihing the server messgae to listeners
  serverProducer.publish(
    post_server_message.channel,
    JSON.stringify(post_server_message)
  );
};
let subscriptionUpdateToOtherServers = async (t, mt, s, ch) => {
  // current server shall intimate other servers
  // this indicates: Activation status of current server
  const post_server_message = {
    type: t,
    //"server-subscription-update",
    messageText: mt,
    //`Updated Servers List`,
    sender: s,
    //`Server-Monitor`,
    channel: ch,
    // "server-channel",
  };
  // publsihing the server messgae to listeners
  serverProducer.publish(
    post_server_message.channel,
    JSON.stringify(post_server_message)
  );
};
deadServers = [];
liveServers = [];

let fetchClientList = async () => {
  var cl = redis.client.clientList();
  var cl_ = await cl;
  //console.log("client lst" + cl_);
  // assume all are dead...
  deadServers = [].concat(liveServers);
  liveServers = [].concat(cl_);
  // now get from redis and check howmany servers are alive..
  cl_.forEach(function (v, i, a) {
    // console.log("connection name = " + v.id);
    // liveServers.push(v);
    // // in the current list of live servers with the monitor
    // // get active connecitons with the id taken from redis list
    // var activeConnections = liveServers.filter((e) => {
    //   return e.id == v.id;
    // });
    // /// if v.id  is not found.. add to list
    // if (activeConnections.length == 0) {
    //   liveServers.push(v);
    // } else {
    //   /// if v.id is found.. then update the status..
    // }
  });
  // console.log(
  //   `Before: live: ${liveServers.length}, dead: ${deadServers.length}`
  // );

  //liveServers.forEach(function (v, i, a)
  var i = 0;
  console.log("LIVE SERVERS" + liveServers);
  while (i < liveServers.length) {
    var ls = liveServers[i];
    console.log("LS: " + ls[0]);
    deleteIfFound(ls);
    i++;
  }
  console.log(
    `After: live: ${liveServers.length}, dead: ${deadServers.length}`
  );
  // var ls = [];
  // var ds = [];
  // liveServers.forEach(function (v, i, a) {
  //   ls.push(v.id);
  //   deadServers.forEach(function (v1, i1, a1) {
  //     if (v.id === v1.id) {
  //       console.log(`same: ${v.id}`);
  //     }
  //   });
  // });

  // console.log(`After: live: ${liveServers}, dead: ${deadServers}`);
  // deadServers.forEach(function (v, i, a) {
  //   //
  //   if (v.id == ls.id) {
  //     console.log("removing from deleted list..: " + a[i].id);
  //     deadServers = deadServers.splice(i, 1);
  //   }
  // });
  //}

  ////console.log("DEAD... " + JSON.stringify(deadServers));

  // is there any use sending live servers list to each server??
  //==========================================================
  // subscriptionUpdateToOtherServers(
  //   "server-subscription-update",
  //   JSON.stringify(liveServers),
  //   serverID,
  //   "server-channel"
  // );
  if (deadServers.length > 0) {
    subscriptionUpdateToOtherServers(
      "server-subscription-update-servers-deleted",
      JSON.stringify(deadServers),
      serverID,
      "server-channel"
    );
  }
  function deleteIfFound(ls) {
    let ind = 0;
    let count = deadServers.length;

    console.log("Elements in dead serves list: " + count);
    console.log("Dead Elements: " + deadServers);
    console.log("==========================================");
    while (ind < count) {
      console.log(
        `ELEMENT at ${ind}, ${ls.id},${redis.currentID} : ` + deadServers
      );
      try {
        if (ls.id != redis.currentID && deadServers[ind]["id"] == ls.id) {
          // console.log("==========================================");
          // console.log(deadServers[ind]);
          // console.log("==========================================");
          console.log(
            `Deleting node ${ls.id} / ${deadServers[ind].id} at  ${ind}, dead count: ${deadServers.length}`
          );
          deadServers.splice(ind, 1);
        }
      } catch (error) {
        console.log("-0-");
      }
      ind = ind + 1;
    }
  }
  // redis.client.clie("list", (err, reply) => {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     console.log("Client list fetched...");
  //     const clientList = reply.toString().split("\n");
  //     let targetClient;

  //     clientList.forEach((client) => {
  //       const clientData = client.split(" ");

  //       if (clientData[1] === "name-of-target-client") {
  //         targetClient = clientData;
  //       }
  //     });
  //   }
  // });

  // client.sendCommand(["client", "list"], (err, reply) => {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     console.log("Client list fetched...");
  //     const clientList = reply.toString().split("\n");
  //     let targetClient;

  //     clientList.forEach((client) => {
  //       const clientData = client.split(" ");

  //       if (clientData[1] === "name-of-target-client") {
  //         targetClient = clientData;
  //       }
  //     });

  //     console.log(targetClient);
  //   }
  // });
};
let fetchClientList_ = async () => {
  // redis.client
  redis.redisProxy
    .multi()
    .client("list")
    .exec(function (err, results) {
      console.log(results);
      console.log(results[0]);
      var res = results[0];
      if (res[1] != null) {
        var pairs = res[1].split(" ");

        //console.log('pairs : ' + pairs);

        pairs.forEach(function (pair) {
          var kv = pair.split("=");

          //console.log('single pairs = : ' + pairs);

          //console.log('single kv = : ' + kv);

          console.log("single kv[0] = : " + kv[0]);

          console.log("single kv[1] = : " + kv[1]);

          // if (kv[0] == "YOOVIJAY" && kv[1] == "YOOVIJAY") {
          //   found = true;
          //   console.log("single kv = : " + kv);
          //   found = false;
          // }
        });
      }
    });
  var data = await redis.redisProxy.send_command("CLIENT", "LIST");
  console.log("clients : " + data);
};

module.exports = {
  sendSubscriptionUpdateToOtherServers,
  serverSubscribeToRedis,
  fetchClientList,
  serverSubscriber,
  serverProducer,
};

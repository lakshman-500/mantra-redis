var fs = require("fs");
const redis = require("redis");
/****************************************************
 *  REDIS PUBLISH/SUBSCRIBE
 ****************************************************/

let client = redis.createClient({
  socket: {
    host: process.env.REDIS_SERVER,
    port: process.env.REDIS_PORT,
  },
  database: process.env.REDIS_DB,
  name: process.env.serverId,
});
// this is the server (application) ID
var serverID = process.env.SERVER_ID;
client.connect().then(async () => {
  console.log(`Connected Redis - OK`);
  console.log("Status Client Initialized");
  //client.set("name", serverID).then((res) => {
  //console.log(res);
  client.clientGetName().then((res) => {
    console.log("connection name is set as  :  " + res);
    client.clientId().then((res) => {
      console.log("connection id is  :  " + res);
      client.clientGetName().then((res1) => {
        console.log("client get name  is  :  " + res1);
      });
    });
  });
  //});
});

// Keys
getRedis = async (key) => {
  client.get(key);
};

setRedis = async (key, value) => {
  return client.set(key, value);
};

closeRedis = async (socket) => {
  if (socket.subscriber) socket.subscriber.close();
};

// When server restarts, we should delete its keys in redis before it starts
deleteAllKeys = async (serverId) => {
  // json.del serverid... should be enough..
  // can remove the below file based work..

  // Read through the keys in the map and delete them all
  fs.readFile(process.env.STATUS_MAP_FILE, function (err, fileString) {
    if (err) {
      console.log(`file not found ${process.env.STATUS_MAP_FILE}`);
      return;
    }
    const map = JSON.parse(fileString);
    console.log("read from file.. " + fileString);
    for (const k in map.keys) {
      console.log("To delete: " + k);
      const statusDomainId = map[key];
      try {
        client.json.del(statusDomainId, key);
      } catch (e) {
        console.log(e);
      }
    }
    // for (const key in map) {
    //   const statusDomainId = map[key];
    //   try {
    //     client.json.del(statusDomainId, key);
    //   } catch (e) {
    //     console.log(e);
    //   }
    // }
  });
  // deleteAllKeys();
  // Get all keys
  let keys = await client.keys("*");

  console.log(`Found ${keys.length}`);
};

module.exports = {
  client,
  setRedis,
  closeRedis,
  deleteAllKeys,
};

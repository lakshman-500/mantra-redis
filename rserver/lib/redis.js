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
});

client.connect().then(() => {
  console.log("Connected Redis - OK");
  console.log("Status Client Initialized");
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
 deleteAllKeys  = async (serverId)=>  {
  // Read through the keys in the map and delete them all
  fs.readFile(process.env.STATUS_MAP_FILE, function (err, fileString) {
    if (err) {
      console.log(`file not found ${process.env.STATUS_MAP_FILE}`);
      return;
    }
    const map = JSON.parse(fileString);
    for (const k in map.keys) {
      console.log("To delete: " +  k);
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

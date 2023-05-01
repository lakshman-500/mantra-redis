let redis = require("./redis");
let utils = require("./utils");

// key-status:domain_id jsonkey- s-{socket-id} value: {u: a: {uuid}: } - we store uuid as key as we can search for that uuid in how many places..
getUserStatus = (userId, os, socket) => {
  // Get current status and update if already present
  // eg:
  let status = {};
  status["a"] = Date.now();
  status["o"] = os;
  status["socket"] = socket.uid;
  status["userId"] = userId; // socket.uid; // we  store this to search for userid while digging
  status["serverId"] = process.env.SERVER_ID;
  return status;
};

addUserStatus = async (domainId, userId, os, socket) => {
  var doc = process.env.SERVER_ID;
  userStatus = getUserStatus(userId, os, socket);
  console.log(userStatus);

  // Add UserStatus
  try {
    console.log("adding user...");
    const key = getStatusChannelKeyForDomain(domainId);
    const path = `$.user.${userId}.${utils.serverId}`;
    //addNestedElement(key, `${userId}`, userStatus);
    //   .then(() => {
    //     console.log("Nested element added successfully");
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });

    //redis.client.json.get(key, async (v) => {

    //await redis.client.json.set(key, `$`, {});
    await redis.client.json.set(`${key}`, `${userId}`, userStatus);
    // console.log("user key: " + `$.${userId}`);
    // await redis.client.json.set(
    //   `$.${userId}`, //key,
    //   `$.${userId}.${utils.serverId}`,
    //   userStatus
    // );
    // We will store path as it is unique against the channel key
    // utils.status_map[path] = key;
    // utils.write_status_map();
    // });
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
};
const addNestedElement = (key, nestedField, nestedValue) => {
  return new Promise((resolve, reject) => {
    redis.client.json.get(key, ".", (err, json) => {
      if (err) {
        reject(err);
      } else {
        const parsedJson = JSON.parse(json);
        const [field, ...subfields] = nestedField.split(".");
        let current = parsedJson;
        while (subfields.length > 0) {
          const subfield = subfields.shift();
          current[subfield] = current[subfield] || {};
          current = current[subfield];
        }
        current[field] = nestedValue;
        const newJson = JSON.stringify(parsedJson);
        redis.client.json.set(key, ".", newJson, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }
    });
  });
};
removeUserStatus = async (domainId, userId, socket) => {
  const key = getStatusChannelKeyForDomain(domainId);
  //const path = `$.s-${serverId}-${socket.uid}`;
  const path = `$.s.${serverId}.${socket.uid}`;
  // Add UserStatus
  try {
    await client.json.del(key, path);
  } catch (e) {
    console.log(e);
  }

  // We will store path as it is unique against the channel key
  delete utils.status_map[path];
  utils.write_status_map();
};

module.exports = {
  addUserStatus,
  removeUserStatus,
};

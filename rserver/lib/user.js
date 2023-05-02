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

getUserSubscritpion = (userStatus) => {
  var fa = Subscriptions.filter((e) => {
    return e.id == userStatus.userId;
  });
  if (fa.length > 0) {
    console.log("add another session..." + userStatus.userId);
    let us = fa[0];
    console.log("element from array.." + us["id"]);
    let svrSubcrs = us["subscrs"];
    var ss = svrSubcrs.filter((e) => {
      return e.serverId == userStatus.serverId;
    });
    let ss0 = ss[0]; //
    let sessions = ss0["sessions"];
    console.log("current sessions : " + sessions);
    sessions.push(userStatus);
    return us;
  } else {
    console.log("add first session..." + userStatus.userId);
    let us = {};
    us["id"] = userStatus["userId"];
    us["subscrs"] = [];
    let svrSub = {};
    svrSub["serverId"] = userStatus["serverId"];
    svrSub["sessions"] = [];
    svrSub["sessions"].push(userStatus);
    // let state = {};
    // state["server"] = svrSub;
    us["subscrs"].push(svrSub);
    Subscriptions.push(us);
    return us;
  }
};
Subscriptions = [];
// checkUserStatus = (userId) => {
//   redis.client.json.get(userId, ".", (err, json) => {
//     if (err) {
//       reject(err);
//     } else {
//       const parsedJson = JSON.parse(json);
//     }
//   });
// };
addUserStatus = async (domainId, userId, os, socket) => {
  var doc = process.env.SERVER_ID;
  var userStatus = getUserStatus(userId, os, socket);
  var subscr = getUserSubscritpion(userStatus);
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
    await redis.client.json.set(`${key}`, `${userId}`, subscr);
    //userStatus);

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

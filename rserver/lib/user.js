let redis = require('./redis');
let utils = require('./utils');


// key-status:domain_id jsonkey- s-{socket-id} value: {u: a: {uuid}: } - we store uuid as key as we can search for that uuid in how many places..
getUserStatus = (userId, os, socket) => {
  // Get current status and update if already present
  // eg:
  let status = {};
  status["a"] = Date.now();
  status["o"] = os;
  status[userId] = socket.uid; // we  store this to search for userid while digging
  return status;
};

addUserStatus = async (domainId, userId, os, socket) => {
  userStatus = getUserStatus(userId, os, socket);

  const key = getStatusChannelKeyForDomain(domainId);
  const path = `$.s-${utils.serverId}-${socket.uid}`;

  console.log(`K: = ${key},  P: =  ${path}`);
  // We will store path as it is unique against the channel key
  utils.status_map[path] = key;
  utils.write_status_map();

  // Add UserStatus
  try {
    console.log(`${key} ${path}`);
    //await client.json.set("1", "$", {});
    await redis.client.json.set(key, path, userStatus);
  } catch (e) {
    console.log(e);
    await redis.client.json.set(key, "$", {});
    await redis.client.json.set(key, path, userStatus);
  }
};

removeUserStatus = async (domainId, userId, socket) => {
  const key = getStatusChannelKeyForDomain(domainId);
  const path = `$.s-${serverId}-${socket.uid}`;

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
	removeUserStatus
}
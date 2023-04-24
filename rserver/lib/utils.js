var fs = require("fs");

const serverId = process.env.SERVER_ID;

// We will store server status map in local file so that 
// we will delete them on abrupt restart if any of the machine
status_map = {};

write_status_map = () => {
  console.log("file Name: " + process.env.STATUS_MAP_FILE);
  fs.writeFileSync("map.json" ,
  //process.env.STATUS_MAP_FILE,
   JSON.stringify(status_map));
};


getStatusChannelKeyForDomain = (domainId) => `status-${domainId}`;

updateActivity = (domainId, userId, os, socket) => {};

// send message to given socket 
// on exception : should we delete socket's redis connection ?
function  sendToSocket(message, socket){
  try {
    socket.emit("new_message", message);
  } catch (e) {
      cn.removeConnection (socket);
  }
}


module.exports = {
    serverId,
    status_map,
    updateActivity,
    write_status_map,
    getStatusChannelKeyForDomain,
    sendToSocket
}
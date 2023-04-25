let utils = require('./utils');
let redis = require('./redis');
let sm = require('./socket_manager');
const ut = require("./utils");
/****************************************************
 *  CHANNELS
 *  Get Channels for the user where he will be listening"""
 * token is the user id?? 
 ****************************************************/
getChannels = async (token) => {
   return ["General","mercury", "venus"];  
};

// Get Status Channel
sendDomainStatuses = async (domainId, _socket) => {
  let key = utils.getStatusChannelKeyForDomain(domainId);
  console.log("Sending statuses", key);
  // all values under the key
  let statuses = await redis.client.json.get(key);
  // values under the kay at specified path
  //let statuses = await redis.client.json.get(key, ".s-" + _socket.uid);
  
  let message = {};
  message.domain_id = domainId;
  message.type = "statuses";
  message.statuses = statuses;
  ut.sendToSocket(JSON.stringify(message), _socket);
};

module.exports = {
    getChannels,
    sendDomainStatuses
}
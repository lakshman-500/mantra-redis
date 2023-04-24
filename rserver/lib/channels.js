let utils = require('./utils');
let redis = require('./redis');
let sm = require('./socket_manager');
const ut = require("./utils");
/****************************************************
 *  CHANNELS
 ****************************************************/
getChannels = async (token) => {
  // We will add domainid to token in real life scenario
  // Get Channels for the user where he will be listening"""
  if (token == "1") return ["General", "mercury", "earth", "venus"];
  else return ["General", "mercury", "venus"];

  // We will subscribe to "{channel}", "{domain-id}-status"
};

// Get Status Channel
sendDomainStatuses = async (domainId, _socket) => {
  let key = utils.getStatusChannelKeyForDomain(domainId);
  console.log("Sending statuses", key);
  let statuses = await redis.client.json.get(key);
  console.log("Sending statuses", statuses);

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
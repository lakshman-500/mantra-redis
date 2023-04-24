let user = require("./user");
let redis = require("./redis");
const cn = require("./connections");
let pubsub = require("./pubsub");
let _channel = require("./channels");

// we will use one producer for all
let producer = redis.client.duplicate();
producer.connect().then(() => console.log("Producer Connected - OK"));

// high level message handler..
// based on message types, delegate to subfunctions
// what to do with socket, incase of exception??
// separately handle: message related exceptions & socket related exceptions
async function handleMessage (socket, messageType, message){
            console.log("on handleMessage: " +  message);
    try {
        console.log("to handle Mesage__: " + messageType);
        if(messageType == "registerClient"){
            await registerClient(socket, message);
        }
        if(messageType == "registerServer"){
            await registerServer(socket, message);
        }
        else if(messageType == "message"){
            await postMessage(socket,message);
        }
        else if(messageType == "typing"){
            await postMessage(socket, message);
        }

    }
    catch (e) {
        console.log(e);
    }
};
/// register server with - specific app bucket
async function registerServer(registration){
    var regJson = JSON.parse(registration);
    var appID = regJson.AppID;
    // will think over
    // var profile =  regJson.Profile;
    // var tokenID = regJson.tokenID;

    // register with server list
    
    // check if old socket id remains, with the app ID & token combination.. 
    // clear all redis cache for clients..!

    // keep map of server's clients
    // keep monitoring clients -     

};

/// register client with - specific app bucket
async function registerClient(socket, registration){

    var regJson = {};
    regJson  =  JSON.parse(registration);
    var appID = regJson.appID;
    var profile =  regJson.profile;
    var tokenID = regJson.tokenID;
  
    let domainId = "1";
    let userId = tokenID;

    // register on general channel
    // register on redis
    // update user status
    // send domain statuses.
 // Get Channels and Register
    let channels = await _channel.getChannels(tokenID);
    console.log("Channels: " + channels);
    // Redis Registration
    await pubsub.subscribeToPubSub(channels, socket);

    // Add user status
    await user.addUserStatus(domainId, userId, "os", socket);

    // Send Domain Statuses
    await _channel.sendDomainStatuses(domainId, socket);
    return;
};

async function  postMessage(socket, messagePost){
    // {"type":"post","messageText":"asdf asdf","sender":"wn9GYpHNm9UDg_tRAAAF","channel":"General"}
    // example:
    // type: "post",
    // messageText: iMsg.value,
    // sender: socket.id,
    // channel: "General",

    //console.log(`${messagePost.type}`);
  
    var msgJson = {};
    //msgJson = messagePost;
    msgJson = JSON.parse(messagePost);
    //JSON.parse(messagePost);;
    //JSON.parse(messagePost);
    var mtype  = msgJson.type;
    var messageText = msgJson.messageText;
    var sender = msgJson.sender;
  console.log(`${mtype},${messageText},${sender}`);
    
    const post_message  = {
            type: "new_message",
            ///mtype,
            messageText: messageText,
            sender: sender,
            channel: "General"
        };

    producer.publish(post_message.channel, JSON.stringify(post_message));
}
module.exports = {
  handleMessage
};

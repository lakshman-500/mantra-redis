const cn = require("./connections");
const mh = require("./message_handler");



// message type definitions
// message is a broad category, where the argument could be list or object.. 
const messageTypes = ["notify", "message", "close"];

// add new connection
// attach events to socket
// including closure of socket connection

function addConnection(socket){

    cn.saveConnection (socket);
  
    socket.emit("notify", "Connection OK | " + new Date());  
  
    socket.on("registerClient" , function(msg){
          mh.handleMessage(socket, "registerClient", msg);   
    });

    socket.on("message",  function (msg)  {    
        console.log("on msg: " +  msg);
        // console.log("is bin: " + isBinary)
        // const data_message = isBinary ? msg : msg.toString();
        // console.log(data_message);
         mh.handleMessage(socket, "message", msg);        
    });

    socket.on("close", async function (){
        cn.removeConnection (socket);
    });
}


module.exports = {  
  addConnection
}
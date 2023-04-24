// const express = require('express');
// const app = express();
// const http = require('http');
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const EventEmitter = require('events');
// const emits = new EventEmitter();

// const io = new Server(server, {
//   cors: {
//     origin:"http://localhost:3001"
//     // "*"    
//     // "http://localhost:3001"
//   }
// });

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });

// io.on('connection', (socket) => {
//   socket.emit("notify",  "Your ID: " + socket.id   + ", @" + new Date());
//   //socket.emit("connected", "Success: " + );
//   //emits.emit("notify", "socket: " + socket.id  );
//   socket.on("message", (msg)=>{  
     
//     console.log( socket.id + ": received from client " + msg);
//   });
// });


// server.close((err)=>{
//   console.log("server stopped");
// });
// server.listen(2222, () => {
//   console.log('listening on *:2222');
// });

// module.exports = server;

// // export default {
// //   server,
// //   emits
// // };


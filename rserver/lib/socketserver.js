const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const EventEmitter = require("events");

const sm = require("./socket_manager");

const emits = new EventEmitter();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    // "*" 
  },
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {

    sm.addConnection (socket);    

});

server.close((err) => {        
  console.log("server stopped");
});
server.listen(2222, () => {
  console.log("listening on *:2222");
});

module.exports = server;
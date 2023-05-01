// socket holder
let sockets = [];

// generate an id, and save connection to array
function saveConnection(socket) {
  const { v4: uuidv4 } = require("uuid");
  // will come from jwt token..
  socket.uid = uuidv4();
  sockets.push(socket);
}

// close socket connection, then remove from connections array..
// also, to remove from redis??
// also, to remove all subscriptions of this socket|user|account ?
function removeConnection(socket) {
  socket.close();
  sockets = sockets.filter((s) => s !== socket);
}

module.exports = {
  saveConnection,
  removeConnection,
};

require("dotenv").config();

// if (process.argv.length != 4) {
//   console.log("Insufficient Args");
//   console.log("===========================================");
//   console.log("node server.js <SERVER-NAME> <PORT>");
//   console.log("===========================================");
// } else {
//   process.env.SERVER_ID = process.argv[2];
//   process.env.SERVER_PORT = process.argv[3];

// process.argv.forEach(function (val, index, array) {
//   console.log(index + ": " + val);
//   if (index == 3) {
//     process.env.SERVER_PORT = val;
//   }
//   if (index == 2) {
//     process.env.SERVER_ID = val;
//   }
// });

const ss = require("./lib/socketserver");

ss.server;

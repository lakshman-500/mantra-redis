<template>
  <div>
    <div>
      <input type="text" v-model="iMsg" id="messageText" autocomplete="off" />
      <button @click="sendMessage">Send</button>
    </div>
    <div class="bg-blue gap-4 p-10">
      <ul>
        <li v-for="l in msgs">
          {{ l }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { io } from "socket.io-client";
import { LogData } from "../utils/logger";
const config = useRuntimeConfig();

// get socket connection..
const socket = new io(config.public["cacheServiceUrl"]);
///"http://localhost:2222"

const iMsg = ref("");
const msgs = ref([]);

onMounted(() => {
  socket.on("notify", (data) => {
    LogData(data);
    // to compile messages list for viewing purposes..
    msgs.value = [...msgs.value, data];
    // send additional details to tag with connection
    postConnection(socket);
  });
});

/// additional detials of connection!
function postConnection(socket) {
  var msg = {
    // app's base url ..
    appID: config.public["baseURL"],
    // more details can be composed as a user  profile.
    profile: {},
    tokenID: config.public["tokenID"],
  };
  socket.emit("registerClient", JSON.stringify(msg));
  socket.on("new_message", (data) => {
    console.log("received..");
    console.log(data);
  });
}
/// all messages from client would go as 'message' types..
/// object structure : type , messageText, sender etc...
function sendMessage(data) {
  console.log(iMsg.value);
  var msg = {
    type: "post",
    messageText: iMsg.value,
    sender: socket.id,
    channel: "General",
  };
  socket.emit("message", JSON.stringify(msg));
}
</script>

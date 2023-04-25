<template>
  <div class="space-y-4 w-full bg-white shadow rounded">
    <div class="grid grid-cols-2 gap-6">
      <div class="shadow-2xl bg-white rounded-lg p-4">
        <input
          class="rounded-lg bg-white w-96 h-full p-x2 hover:border-red"
          type="text"
          v-model="iMsg"
          id="messageText"
          autocomplete="off"
        />
        <button
          @click="sendMessage"
          class="animate-bounce transition ease-in-out delay-150 duration-700 rounded-lg bg-blue w-16 h-full p-x2 m-x3 hover:bg-blue-300 hover:scale-110 hover:rotate-15 hover:-translate-y-2 hover:skew-y-6"
        >
          Send
        </button>
      </div>
      <div
        class="shadow-2xl bg-white rounded-lg hover:bg-blue-400 hover:skew-x-20 hover:origin-bottom-left hover:transition-shadow"
      >
        <ul>
          <li v-for="l in msgs">
            {{ l }}
          </li>
        </ul>
      </div>
      <div class="shadow-2xl bg-white rounded-lg bg-blue-500 aspect-square">
        <ul>
          <li v-for="l in serverMsgs">
            <div v-if="l.type === 'channel-subscription'">
              {{ l.type }} : {{ l.messageText }}
            </div>
            <div v-if="l.type === 'statuses'">
              Domain [{{ l.domain_id }}] : {{ l.type }}
            </div>
            <div v-if="l.type === 'redis-msg'">
              {{ l.type }} : {{ l.messageText }}
            </div>
          </li>
        </ul>
      </div>
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
const serverMsgs = ref([]);

onMounted(() => {
  socket.on("notify", (data) => {
    ///LogData(data);
    // to compile messages list for viewing purposes..
    var d = {};
    d = data; //JSON.parse(data);
    msgs.value.push(data); // = [...msgs.value, data];
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
    console.log("received new msg..");
    console.log(data);
    var d = {};
    d = JSON.parse(data);

    serverMsgs.value = [...serverMsgs.value, d];
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

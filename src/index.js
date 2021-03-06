const express = require("express");
var cors = require("cors");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const httpServer = require("http").createServer(app);
var port = process.env.PORT || 8000;
const options = {
  cors: {
    origin: "*",
  },
};
const io = require("socket.io")(httpServer, options);

require("./utils/addPrototype");
const socketEvents = require("./socketEvents");

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("connect mongodb success");
}
main().catch((err) => console.log(err));

var api = require("./routers");
app.use(cors());
app.use(express.json());
app.use("/", api);

const onConnection = (socket) => {
  console.log("connected");
  const onDisconnected = () => {
    console.log("disconnected");
  };
  socket.on("disconnect", onDisconnected);
  socketEvents(io, socket);
};
io.on("connection", onConnection);

httpServer.listen(port, () => {
  console.log(`listening on ${port}`);
});

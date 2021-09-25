const app = require("express")();
const mongoose = require("mongoose");
require("dotenv").config();
const httpServer = require("http").createServer(app);
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

app.get("/", (req, res) => {
  res.send("oke");
});

const onConnection = (socket) => {
  console.log("connected");
  const onDisconnected = () => {
    console.log("disconnected");
  };
  socket.on("disconnect", onDisconnected);
  socketEvents(io, socket);
};
io.on("connection", onConnection);

httpServer.listen(3000, () => {
  console.log("listening on *:3000");
});

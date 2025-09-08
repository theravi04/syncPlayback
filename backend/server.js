const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for testing
    methods: ["GET", "POST"],
  },
});

app.use(cors());



const rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle joining a room
  socket.on("join-room", ( roomId ) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);

    // Sync new user with existing state
    if (rooms[roomId]) {
      socket.emit("sync-music", rooms[roomId]);
    }
  });

  // Handle loading a video
  socket.on("load-video", ({ roomId, url, time, playing }) => {
    rooms[roomId] = { url, time, playing };
    io.to(roomId).emit("sync-music", rooms[roomId]);
  });

  // Handle play
  socket.on("play-music", ({ roomId, url, time, playing }) => {
    rooms[roomId] = { url, time, playing };
    socket.to(roomId).emit("sync-music", rooms[roomId]);
  });

  // Handle pause
  socket.on("pause-music", ({ roomId, url, time, playing }) => {
    rooms[roomId] = { url, time, playing };
    socket.to(roomId).emit("sync-music", rooms[roomId]);
  });

  // Handle seek
  socket.on("seek-music", ({ roomId, url, time, playing }) => {
    rooms[roomId] = { url, time, playing };
    socket.to(roomId).emit("sync-music", rooms[roomId]);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});

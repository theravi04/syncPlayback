const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow requests from all origins
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle joining a room
  socket.on("join-room", ({roomId, name}) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId} & name: ${name}`);

    if(!rooms[roomId]) {
        rooms[roomId] = { users: [], video: null}
    }

    rooms[roomId].users.push({ id: socket.id, name });

    console.log(`${name} joined room ${roomId}`);

    // Notify everyone in the room about updated users list
    io.to(roomId).emit("users-update", rooms[roomId].users);

    // Send current video state if any
    if (rooms[roomId].video) {
      socket.emit("sync-music", rooms[roomId].video);
    }
  });

  // Handle loading a video
  socket.on("load-video", ({ roomId, url, time, playing }) => {
    rooms[roomId].video = { url, time, playing };

    // Broadcast to everyone in that room
    io.to(roomId).emit("sync-music", rooms[roomId]);
  });

  // Handle play
  socket.on("play-music", ({ roomId, url, time, playing }) => {
    rooms[roomId].video = { url, time, playing };

    socket.to(roomId).emit("sync-music", rooms[roomId]);
  });

  // Handle pause
  socket.on("pause-music", ({ roomId, url, time, playing }) => {
    rooms[roomId].video = { url, time, playing };

    socket.to(roomId).emit("sync-music", rooms[roomId]);
  });

  // Handle seek
  socket.on("seek-music", ({ roomId, url, time, playing }) => {
    rooms[roomId].video = { url, time, playing };

    socket.to(roomId).emit("sync-music", rooms[roomId]);
  });

  socket.on("leave-room", (roomId) => {
  if (rooms[roomId]) {
    rooms[roomId].users = rooms[roomId].users.filter(u => u.id !== socket.id);
    io.to(roomId).emit("users-update", rooms[roomId].users);
  }
  socket.leave(roomId);
});


  // Handle disconnect
  socket.on("disconnect", () => {
    // Remove user from all rooms
    for (const roomId in rooms) {
      rooms[roomId].users = rooms[roomId].users.filter(u => u.id !== socket.id);
      io.to(roomId).emit("users-update", rooms[roomId].users);
    }
    console.log("A user disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});

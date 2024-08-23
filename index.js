const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const cors = require("cors");

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0"; // Use this for deployment environments like Vercel

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  transports: ['polling'], // Enable polling as a fallback
});

app.use(cors({
  origin: "https://node-pink-chi.vercel.app", // Replace with your frontend URL
  methods: ["GET", "POST"],
}));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("new user", (data) => {
    socket.userId = data;
    io.emit("new user", [...activeUsers]);
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
  });

  socket.on("chat message", (data) => {
    io.emit("chat message", data);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

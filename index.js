const express = require("express");
const socket = require("socket.io");
const path = require("path");

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0"; // Vercel will dynamically assign the host and port

const app = express();

app.use(express.static(path.join(__dirname, "public")));
// Serve static files from the "public" directory
app.use(express.static("public"));

// Route for the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(PORT, HOST, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://${HOST}:${PORT}`);
});

// Socket setup
const io = socket(server, {
  transports: ['polling'],
});

const activeUsers = new Set();

io.on("connection", function (socket) {
  socket.on("new user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    io.emit("new user", [...activeUsers]);
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
  });

  socket.on("chat message", function (data) {
    io.emit("chat message", data);
  });

  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });
});

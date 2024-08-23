const express = require("express");
const http = require("http"); // Use http.createServer instead of app.listen
const socketIo = require("socket.io");
const path = require("path");

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0"; // Vercel will dynamically assign the host and port

const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Route for the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Create an HTTP server and pass it to Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  transports: ['polling'], // Ensure that polling is enabled
});

const activeUsers = new Set();

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("new user", (data) => {
    socket.userId = data;
    activeUsers.add(data);
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

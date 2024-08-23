const socket = io("https://node-pink-chi.vercel.app");

socket.on("connect", () => {
    console.log("Connected to Socket.io server");
});

socket.on("message", (data) => {
    console.log("Message received:", data);
});

socket.emit("message", { text: "Hello, server!" });
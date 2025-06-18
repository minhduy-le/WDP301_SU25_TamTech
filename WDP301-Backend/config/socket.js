const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { secret } = require("./jwtConfig");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust this in production to specific origins
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, secret);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user.id}`);

    // Join user to their own room
    socket.join(`user:${socket.user.id}`);

    // Handle ping
    socket.on("ping", (cb) => {
      cb({ status: "pong" });
    });

    // Handle sending messages
    socket.on("sendMessage", async (messageData, callback) => {
      try {
        const { receiverId, content } = messageData;
        if (!receiverId || !content) {
          return callback({ error: "Missing receiverId or content" });
        }

        // Here you would typically save to DB (handled in service)
        const chatMessage = {
          id: Date.now(), // Temporary ID, should come from DB
          senderId: socket.user.id,
          receiverId,
          content,
          createdAt: new Date(),
          Sender: { id: socket.user.id, fullName: socket.user.fullName },
        };

        // Emit to receiver
        io.to(`user:${receiverId}`).emit("message", chatMessage);
        // Emit back to sender
        socket.emit("message", chatMessage);

        callback({ success: true, message: chatMessage });
      } catch (error) {
        console.error("Error sending message:", error);
        callback({ error: "Failed to send message" });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ User disconnected: ${socket.user.id}, Reason: ${reason}`);
    });

    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.user.id}:`, error);
    });
  });

  return io;
};

module.exports = { initializeSocket };
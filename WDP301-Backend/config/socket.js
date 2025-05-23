const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./message");
const ChatRoomUser = require("./ChatRoomUser");

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*", // Adjust this in production to specific origins
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Verify JWT token on connection
    const token = socket.handshake.auth.token;
    if (!token) {
      socket.emit("error", { message: "No token provided" });
      socket.disconnect();
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err || !decoded.id) {
        socket.emit("error", { message: "Invalid token" });
        socket.disconnect();
        return;
      }
      socket.userId = decoded.id; // Store userId on socket
      console.log(`User connected: ${socket.userId} (Socket ID: ${socket.id})`);

      // Join user-specific room for direct messages
      socket.join(`user_${socket.userId}`);
    });

    // Join a chat room
    socket.on("joinRoom", async ({ chatRoomId }) => {
      try {
        const userId = socket.userId;
        // Verify user is part of the chat room
        const chatRoomUser = await ChatRoomUser.findOne({
          where: { chatRoomId, userId },
        });
        if (!chatRoomUser) {
          socket.emit("error", { message: "User not in chat room" });
          return;
        }
        socket.join(`room_${chatRoomId}`);
        socket.emit("message", { message: `Joined room ${chatRoomId}` });
      } catch (error) {
        socket.emit("error", { message: "Error joining room", error });
      }
    });

    // Handle sending a message
    socket.on("sendMessage", async ({ chatRoomId, receiverId, content }) => {
      try {
        const senderId = socket.userId;
        const message = await Message.create({
          chatRoomId,
          senderId,
          receiverId,
          content,
        });

        // Emit to chat room or specific receiver
        if (chatRoomId) {
          io.to(`room_${chatRoomId}`).emit("message", {
            id: message.id,
            chatRoomId,
            senderId,
            content,
            createdAt: message.createdAt,
          });
        } else if (receiverId) {
          // For direct messages, emit to sender and receiver
          socket.emit("message", {
            id: message.id,
            senderId,
            receiverId,
            content,
            createdAt: message.createdAt,
          });
          socket.to(`user_${receiverId}`).emit("message", {
            id: message.id,
            senderId,
            receiverId,
            content,
            createdAt: message.createdAt,
          });
        }
      } catch (error) {
        socket.emit("error", { message: "Error sending message", error });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId} (Socket ID: ${socket.id})`);
    });
  });

  return io;
};

module.exports = initializeSocket;

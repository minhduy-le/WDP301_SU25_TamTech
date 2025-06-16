const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("../models/message");
const ChatRoomUser = require("../models/ChatRoomUser");
const User = require("../models/user");

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*", // Cho phép tất cả các nguồn gốc
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Track all connected users
  const connectedUsers = new Map(); // userId -> Set of socketIds
  const socketToUser = new Map(); // socketId -> userId

  io.on("connection", (socket) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.error("❌ No token provided for socket connection");
      socket.emit("error", { message: "No token provided" });
      socket.disconnect();
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err || !decoded.id) {
        console.error("❌ Invalid token:", {
          error: err?.message || "No user ID in token",
          token: token.substring(0, 10) + "...", // Log một phần token để debug
        });
        socket.emit("error", { message: "Invalid token" });
        socket.disconnect();
        return;
      }

      socket.userId = decoded.id;
      socketToUser.set(socket.id, decoded.id);

      console.log(`✅ User connected: ${socket.userId} (Socket ID: ${socket.id})`);

      // Track this connection
      if (!connectedUsers.has(socket.userId)) {
        connectedUsers.set(socket.userId, new Set());
      }
      connectedUsers.get(socket.userId).add(socket.id);

      socket.join(`user_${socket.userId}`);

      // Join all chat rooms the user is part of
      ChatRoomUser.findAll({ where: { userId: socket.userId } }).then((chatRoomUsers) => {
        chatRoomUsers.forEach((chatRoomUser) => {
          socket.join(`room_${chatRoomUser.chatRoomId}`);
          console.log(`✅ User ${socket.userId} joined room_${chatRoomUser.chatRoomId}`);
        });
      });

      // Log current connections
      console.log(`👥 Total connections for user ${socket.userId}:`, connectedUsers.get(socket.userId).size);
      console.log(`👥 All connected users:`, Array.from(connectedUsers.keys()));
      const totalSocketConnections = Array.from(connectedUsers.values()).reduce(
        (sum, socketSet) => sum + socketSet.size,
        0
      );
      console.log(`👥 Total socket connections:`, totalSocketConnections);

      socket.on("sendMessage", async ({ chatRoomId, receiverId, content }, callback) => {
        try {
          const senderId = socket.userId;
          if (!senderId) {
            throw new Error("User not authenticated");
          }

          console.log(`📤 Sending message from ${senderId} to ${receiverId || "room " + chatRoomId}:`, content);

          const message = await Message.create({
            chatRoomId,
            senderId,
            receiverId,
            content,
          });

          const sender = await User.findByPk(senderId, { attributes: ["id", "fullName"] });
          const receiver = receiverId ? await User.findByPk(receiverId, { attributes: ["id", "fullName"] }) : null;

          const messageData = {
            id: message.id,
            chatRoomId: message.chatRoomId || null,
            senderId,
            receiverId,
            content,
            createdAt: message.createdAt,
            Sender: sender ? { id: sender.id, fullName: sender.fullName } : { id: senderId, fullName: "Unknown" },
            Receiver: receiver
              ? { id: receiver.id, fullName: receiver.fullName }
              : receiverId
              ? { id: receiverId, fullName: "Unknown" }
              : null,
          };

          console.log("📤 Emitting message:", {
            id: messageData.id,
            senderId: messageData.senderId,
            receiverId: messageData.receiverId,
            content: messageData.content,
          });

          if (chatRoomId) {
            console.log(`📤 Emitting to room_${chatRoomId}`);
            io.to(`room_${chatRoomId}`).emit("message", messageData);
          } else if (receiverId) {
            const senderConnections = connectedUsers.get(senderId) || new Set();
            const receiverConnections = connectedUsers.get(receiverId) || new Set();

            console.log(`📤 Sender connections (${senderId}):`, Array.from(senderConnections));
            console.log(`📤 Receiver connections (${receiverId}):`, Array.from(receiverConnections));
            console.log(
              `📤 Found ${senderConnections.size} sender sockets and ${receiverConnections.size} receiver sockets`
            );

            io.to(`user_${senderId}`).emit("message", messageData);
            io.to(`user_${receiverId}`).emit("message", messageData);

            const senderRoom = io.sockets.adapter.rooms.get(`user_${senderId}`);
            const receiverRoom = io.sockets.adapter.rooms.get(`user_${receiverId}`);

            console.log(`📤 Sender room size: ${senderRoom?.size || 0}`);
            console.log(`📤 Receiver room size: ${receiverRoom?.size || 0}`);

            if (!receiverRoom || receiverRoom.size === 0) {
              console.log(`⚠️ Receiver ${receiverId} is not connected to receive the message`);
            } else {
              console.log(`✅ Message emitted to receiver ${receiverId}`);
            }
          }

          if (callback) callback({ success: true, message: "Message sent" });
        } catch (error) {
          console.error("❌ Error sending message:", error.message);
          socket.emit("error", { message: "Error sending message", error: error.message });
          if (callback) callback({ success: false, error: error.message });
        }
      });

      socket.on("disconnect", () => {
        const userId = socketToUser.get(socket.id);
        console.log(`❌ User disconnected: ${userId} (Socket ID: ${socket.id})`);

        // Remove from tracking
        if (userId && connectedUsers.has(userId)) {
          connectedUsers.get(userId).delete(socket.id);
          if (connectedUsers.get(userId).size === 0) {
            connectedUsers.delete(userId);
          }
          console.log(`👥 Remaining connections for user ${userId}:`, connectedUsers.get(userId)?.size || 0);
        }

        socketToUser.delete(socket.id);
        const totalSocketConnections = Array.from(connectedUsers.values()).reduce(
          (sum, socketSet) => sum + socketSet.size,
          0
        );
        console.log(`👥 Total socket connections:`, totalSocketConnections);
      });

      // Add a ping endpoint to check connectivity
      socket.on("ping", (callback) => {
        console.log(`🏓 Ping from user ${socket.userId}`);
        if (callback) callback({ success: true, userId: socket.userId, socketId: socket.id });
      });
    });

    return io;
  });
};
module.exports = initializeSocket;

// socket.js

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

  /**
   * Middleware xác thực token cho mỗi kết nối Socket.IO
   */
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.error("❌ No token provided for socket connection");
      return next(new Error("No token provided")); // Từ chối kết nối
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err || !decoded.id) {
        console.error("❌ Invalid token:", {
          error: err?.message || "No user ID in token",
          token: token.substring(0, 10) + "...",
        });
        return next(new Error("Invalid token")); // Từ chối kết nối
      }

      // Gắn thông tin user vào đối tượng socket để sử dụng sau này
      socket.userId = decoded.id;
      next(); // Cho phép kết nối
    });
  });

  io.on("connection", (socket) => {
    // Từ đây trở đi, mọi socket đã được xác thực
    const userId = socket.userId;
    socketToUser.set(socket.id, userId);

    console.log(`✅ User connected: ${userId} (Socket ID: ${socket.id})`);

    // Track this connection
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId).add(socket.id);

    // Mỗi user sẽ join vào một "phòng" riêng của mình
    // để có thể nhận tin nhắn trực tiếp dễ dàng
    socket.join(`user_${userId}`);

    // Join all chat rooms the user is part of
    ChatRoomUser.findAll({ where: { userId: userId } }).then((chatRoomUsers) => {
      chatRoomUsers.forEach((chatRoomUser) => {
        const roomName = `room_${chatRoomUser.chatRoomId}`;
        socket.join(roomName);
        console.log(`✅ User ${userId} joined ${roomName}`);
      });
    });

    // Log current connections
    console.log(`👥 Total connections for user ${userId}:`, connectedUsers.get(userId).size);
    console.log(`👥 All connected users:`, Array.from(connectedUsers.keys()));
    const totalSocketConnections = Array.from(connectedUsers.values()).reduce(
      (sum, socketSet) => sum + socketSet.size,
      0
    );
    console.log(`👥 Total socket connections:`, totalSocketConnections);

    // --- Xử lý các sự kiện khác ---

    socket.on("sendMessage", async ({ chatRoomId, receiverId, content }, callback) => {
      try {
        const senderId = socket.userId; // Lấy từ socket, đã được xác thực

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

        console.log("📤 Emitting message:", { id: messageData.id, senderId, receiverId, content });

        if (chatRoomId) {
          io.to(`room_${chatRoomId}`).emit("message", messageData);
        } else if (receiverId) {
          // Gửi cho tất cả các socket của người gửi và người nhận
          io.to(`user_${senderId}`).to(`user_${receiverId}`).emit("message", messageData);
        }

        if (callback) callback({ success: true, message: "Message sent" });
      } catch (error) {
        console.error("❌ Error sending message:", error.message);
        // Không emit lỗi chung, chỉ trả về qua callback
        if (callback) callback({ success: false, error: error.message });
      }
    });

    socket.on("disconnect", () => {
      const disconnectedUserId = socketToUser.get(socket.id);
      console.log(`❌ User disconnected: ${disconnectedUserId} (Socket ID: ${socket.id})`);

      if (disconnectedUserId && connectedUsers.has(disconnectedUserId)) {
        const userSockets = connectedUsers.get(disconnectedUserId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          connectedUsers.delete(disconnectedUserId);
        }
        console.log(`👥 Remaining connections for user ${disconnectedUserId}:`, userSockets?.size || 0);
      }

      socketToUser.delete(socket.id);
      const totalSocketConnectionsAfterDisconnect = Array.from(connectedUsers.values()).reduce(
        (sum, socketSet) => sum + socketSet.size,
        0
      );
      console.log(`👥 Total socket connections:`, totalSocketConnectionsAfterDisconnect);
    });

    socket.on("ping", (callback) => {
      console.log(`🏓 Ping from user ${socket.userId}`);
      if (callback) callback({ success: true, userId: socket.userId, socketId: socket.id });
    });
  });

  return io;
};

module.exports = initializeSocket;

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

  // Middleware để xác thực token cho mỗi kết nối Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token; // Lấy token từ handshake
    if (!token) {
      console.error("❌ Socket Auth Error: No token provided.");
      return next(new Error("No token provided")); // Từ chối kết nối
    }

    jwt.verify(token, abc1b062fb4d5b0543294a9999dc4a9c3f0996be1044b5dd6389eb3dda8331f8, (err, decoded) => {
      if (err || !decoded.id) {
        console.error("❌ Socket Auth Error: Invalid token.", { error: err?.message || "No user ID" });
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
    console.log(`✅ User connected: ${userId} (Socket ID: ${socket.id})`);

    // Mỗi user sẽ join vào một "phòng" riêng của mình
    // để có thể nhận tin nhắn trực tiếp dễ dàng
    socket.join(`user_${userId}`);

    socket.on("sendMessage", async ({ chatRoomId, receiverId, content }, callback) => {
      try {
        const senderId = socket.userId;
        console.log(`📤 Message from ${senderId} to ${receiverId || "room " + chatRoomId}:`, content);

        const message = await Message.create({
          chatRoomId,
          senderId,
          receiverId,
          content,
        });

        // Lấy thông tin người gửi và người nhận để gửi kèm tin nhắn
        const sender = await User.findByPk(senderId, { attributes: ["id", "fullName"] });
        const receiver = receiverId ? await User.findByPk(receiverId, { attributes: ["id", "fullName"] }) : null;

        const messageData = {
          id: message.id,
          chatRoomId: message.chatRoomId || null,
          senderId,
          receiverId,
          content,
          createdAt: message.createdAt,
          Sender: sender?.get({ plain: true }),
          Receiver: receiver?.get({ plain: true }),
        };

        if (chatRoomId) {
          // Gửi đến một phòng chat cụ thể
          io.to(`room_${chatRoomId}`).emit("message", messageData);
        } else if (receiverId) {
          // Gửi trực tiếp cho người nhận và cả người gửi (để đồng bộ trên các thiết bị)
          io.to(`user_${senderId}`).to(`user_${receiverId}`).emit("message", messageData);
        }

        if (callback) callback({ success: true, message: "Message sent" });
      } catch (error) {
        console.error("❌ Error sending message:", error.message);
        if (callback) callback({ success: false, error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.userId} (Socket ID: ${socket.id})`);
    });

    socket.on("ping", (callback) => {
      if (callback) callback({ success: true, userId: socket.userId });
    });
  });

  return io; // QUAN TRỌNG: return io ở đúng vị trí
};

module.exports = initializeSocket;

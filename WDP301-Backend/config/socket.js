const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("../models/message");
const ChatRoomUser = require("../models/ChatRoomUser");
const User = require("../models/user");

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: [
        "https://wdp301-su25.space",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5173/manager/chat",
        "https://wdp301-su25.space/manager/chat",
        "*",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    // SỬA LẠI CÁC DÒNG DƯỚI ĐÂY
    // Bỏ hoặc thay đổi `transports` và `allowUpgrades`
    transports: ["polling", "websocket"], // Mặc định, cho phép cả hai
    allowUpgrades: true, // Mặc định, cho phép nâng cấp kết nối

    // Các tùy chọn khác có thể giữ lại nếu cần
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware xác thực
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace("Bearer ", "") ||
        socket.handshake.query.token; // Thêm query token

      if (!token) {
        console.error("❌ Socket Auth Error: No token provided.");
        return next(new Error("Authentication error: No token provided"));
      }

      const jwtSecret = process.env.JWT_SECRET || "abc1b062fb4d5b0543294a9999dc4a9c3f0996be1044b5dd6389eb3dda8331f8";

      jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
          console.error("❌ Socket Auth Error: Invalid token.", { error: err.message });
          return next(new Error("Authentication error: Invalid token"));
        }

        if (!decoded.id) {
          console.error("❌ Socket Auth Error: No user ID in token.");
          return next(new Error("Authentication error: No user ID"));
        }

        socket.userId = decoded.id;
        console.log(`🔐 Socket authenticated for user: ${decoded.id}`);
        next();
      });
    } catch (error) {
      console.error("❌ Socket Auth Error:", error.message);
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`✅ User connected: ${userId} (Socket ID: ${socket.id}) - Transport: ${socket.conn.transport.name}`);

    // Join user room
    socket.join(`user_${userId}`);

    // Heartbeat để maintain connection
    const heartbeat = setInterval(() => {
      if (socket.connected) {
        socket.emit("heartbeat", { timestamp: Date.now() });
      } else {
        clearInterval(heartbeat);
      }
    }, 30000);

    // Xử lý upgrade transport
    socket.conn.on("upgrade", () => {
      console.log(`🔄 User ${userId} upgraded to ${socket.conn.transport.name}`);
    });

    socket.on("joinChatRoom", async (chatRoomId) => {
      try {
        const chatRoomUser = await ChatRoomUser.findOne({
          where: { chatRoomId, userId },
        });

        if (chatRoomUser) {
          socket.join(`room_${chatRoomId}`);
          console.log(`✅ User ${userId} joined chat room ${chatRoomId}`);
          socket.emit("joinedChatRoom", { chatRoomId, success: true });
        } else {
          socket.emit("joinedChatRoom", {
            chatRoomId,
            success: false,
            error: "Not authorized to join this room",
          });
        }
      } catch (error) {
        console.error("❌ Error joining chat room:", error.message);
        socket.emit("joinedChatRoom", {
          chatRoomId,
          success: false,
          error: "Failed to join room",
        });
      }
    });

    socket.on("sendMessage", async ({ chatRoomId, receiverId, content }, callback) => {
      try {
        const senderId = socket.userId;
        console.log(`📤 Message from ${senderId} to ${receiverId || "room " + chatRoomId}:`, content);

        if (!content || content.trim() === "") {
          const error = "Message content cannot be empty";
          console.error("❌", error);
          if (callback) callback({ success: false, error });
          return;
        }

        // Validate chat room membership
        if (chatRoomId) {
          const chatRoomUser = await ChatRoomUser.findOne({
            where: { chatRoomId, userId: senderId },
          });
          if (!chatRoomUser) {
            const error = "Not authorized to send message to this room";
            console.error("❌", error);
            if (callback) callback({ success: false, error });
            return;
          }
        }

        const message = await Message.create({
          chatRoomId,
          senderId,
          receiverId,
          content: content.trim(),
        });

        const sender = await User.findByPk(senderId, { attributes: ["id", "fullName"] });
        const receiver = receiverId ? await User.findByPk(receiverId, { attributes: ["id", "fullName"] }) : null;

        const messageData = {
          id: message.id,
          chatRoomId: message.chatRoomId || null,
          senderId,
          receiverId,
          content: content.trim(),
          createdAt: message.createdAt,
          Sender: sender?.get({ plain: true }),
          Receiver: receiver?.get({ plain: true }),
        };

        // Emit message
        if (chatRoomId) {
          io.to(`room_${chatRoomId}`).emit("message", messageData);
        } else if (receiverId) {
          io.to(`user_${senderId}`).to(`user_${receiverId}`).emit("message", messageData);
        }

        if (callback)
          callback({
            success: true,
            message: "Message sent successfully",
            data: messageData,
          });
      } catch (error) {
        console.error("❌ Error sending message:", error.message);
        if (callback) callback({ success: false, error: "Failed to send message" });
      }
    });

    // Handle heartbeat response
    socket.on("heartbeat-response", () => {
      console.log(`💓 Heartbeat from user ${userId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ User disconnected: ${socket.userId} (Socket ID: ${socket.id}) - Reason: ${reason}`);
      clearInterval(heartbeat);
    });

    socket.on("ping", (callback) => {
      if (callback)
        callback({
          success: true,
          userId: socket.userId,
          timestamp: new Date().toISOString(),
        });
    });

    socket.on("error", (error) => {
      console.error(`❌ Socket error for user ${socket.userId}:`, error);
    });
  });

  // Global error handling
  io.engine.on("connection_error", (err) => {
    console.error("❌ Connection error:", {
      message: err.message,
      description: err.description,
      context: err.context,
      type: err.type,
    });
  });

  return io;
};

module.exports = initializeSocket;

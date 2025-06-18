const Message = require("../models/message");
const ChatRoomUser = require("../models/ChatRoomUser");
const User = require("../models/user");
const ChatRoom = require("../models/chatRoom"); // Add this import
const { Op } = require("sequelize");

const createMessage = async ({ chatRoomId, senderId, receiverId, content }) => {
  // Validate inputs
  if (!senderId || !content) {
    throw new Error("Sender ID and content are required");
  }

  // If chatRoomId is provided, verify user is in the chat room
  if (chatRoomId) {
    const chatRoomUser = await ChatRoomUser.findOne({
      where: { chatRoomId, userId: senderId },
    });
    if (!chatRoomUser) {
      throw new Error("User not in chat room");
    }
  }

  // If receiverId is provided, verify receiver exists
  if (receiverId) {
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      throw new Error("Receiver not found");
    }
  }

  // Create the message
  const message = await Message.create({
    chatRoomId,
    senderId,
    receiverId,
    content,
  });

  return message;
};

const getMessages = async ({ chatRoomId, userId, limit = 50, offset = 0 }) => {
  // If chatRoomId is provided, verify user is in the chat room
  if (chatRoomId) {
    const chatRoomUser = await ChatRoomUser.findOne({
      where: { chatRoomId, userId },
    });
    if (!chatRoomUser) {
      throw new Error("User not in chat room");
    }
  }

  // Build query
  const where = chatRoomId ? { chatRoomId } : { [Op.or]: [{ senderId: userId }, { receiverId: userId }] };

  const messages = await Message.findAll({
    where,
    include: [
      { model: User, as: "Sender", attributes: ["id", "fullName"] },
      { model: User, as: "Receiver", attributes: ["id", "fullName"] },
      { model: ChatRoom, as: "ChatRoom", attributes: ["id", "name"] },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return messages;
};

module.exports = {
  createMessage,
  getMessages,
};

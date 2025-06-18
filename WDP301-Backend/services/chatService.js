const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createChat = async ({ senderId, receiverId, content }) => {
  try {
    const chat = await prisma.chat.create({
      data: {
        senderId,
        receiverId,
        content,
      },
      include: {
        Sender: { select: { id: true, fullName: true } },
        Receiver: { select: { id: true, fullName: true } },
      },
    });
    return chat;
  } catch (error) {
    console.error("Error creating chat in service:", error);
    throw error;
  }
};

const getChatsByUser = async (userId, receiverId, limit, offset) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: parseInt(receiverId) },
          { senderId: parseInt(receiverId), receiverId: userId },
        ],
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "asc" },
      include: {
        Sender: { select: { id: true, fullName: true } },
        Receiver: { select: { id: true, fullName: true } },
      },
    });
    return chats;
  } catch (error) {
    console.error("Error fetching chats in service:", error);
    throw error;
  }
};

module.exports = { createChat, getChatsByUser };
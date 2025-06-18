const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verifyToken");
const { createChat, getChatsByUser } = require("../services/chatService");

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Create a new chat message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chat message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 senderId:
 *                   type: integer
 *                 receiverId:
 *                   type: integer
 *                 content:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ error: "Missing receiverId or content" });
    }

    const chat = await createChat({
      senderId: req.user.id,
      receiverId,
      content,
    });

    res.status(201).json(chat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Failed to create chat" });
  }
});

/**
 * @swagger
 * /chat/messages:
 *   get:
 *     summary: Get chat messages for authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: receiverId
 *         schema:
 *           type: integer
 *         description: ID of the user to get chat messages with
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of messages to skip
 *     responses:
 *       200:
 *         description: List of chat messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   senderId:
 *                     type: integer
 *                   receiverId:
 *                     type: integer
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   Sender:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       fullName:
 *                         type: string
 *                   Receiver:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       fullName:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/messages", verifyToken, async (req, res) => {
  try {
    const { receiverId, limit = 50, offset = 0 } = req.query;
    const chats = await getChatsByUser(req.user.id, parseInt(receiverId), parseInt(limit), parseInt(offset));
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

module.exports = router;

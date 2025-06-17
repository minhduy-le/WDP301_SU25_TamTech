const express = require("express");
const router = express.Router();
const chatMessageAIService = require("../services/chatMessageAIService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/chat-message-ai:
 *   post:
 *     summary: Send a message to the AI and get a response
 *     tags: [ChatMessageAI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: User's message to the AI
 *     responses:
 *       201:
 *         description: Message sent and AI response received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 responseFromAI:
 *                   type: string
 *                 senderId:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all AI chat messages for the authenticated user
 *     tags: [ChatMessageAI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of AI chat messages for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   message:
 *                     type: string
 *                   responseFromAI:
 *                     type: string
 *                   senderId:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const senderId = req.userId; // From JWT token via verifyToken
    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }
    const chatMessage = await chatMessageAIService.createChatMessageAI({
      message,
      senderId,
    });
    res.status(201).json(chatMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const messages = await chatMessageAIService.getChatMessagesByUser(req.userId);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
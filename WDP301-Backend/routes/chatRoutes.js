const express = require("express");
const router = express.Router();
const chatService = require("../services/chatService");
const verifyToken = require("../middlewares/verifyToken");
const { Op } = require("sequelize");

// /**
//  * @swagger
//  * /api/chat/messages:
//  *   post:
//  *     summary: Send a new message
//  *     tags: [Chat]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - content
//  *             properties:
//  *               chatRoomId:
//  *                 type: integer
//  *                 description: ID of the chat room (optional if sending direct message)
//  *               receiverId:
//  *                 type: integer
//  *                 description: ID of the receiver (optional if sending to chat room)
//  *               content:
//  *                 type: string
//  *                 description: Message content
//  *     responses:
//  *       201:
//  *         description: Message created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 id:
//  *                   type: integer
//  *                 chatRoomId:
//  *                   type: integer
//  *                 senderId:
//  *                   type: integer
//  *                 receiverId:
//  *                   type: integer
//  *                 content:
//  *                   type: string
//  *                 createdAt:
//  *                   type: string
//  *                   format: date-time
//  *       400:
//  *         description: Invalid input
//  *       401:
//  *         description: Unauthorized
//  */
// router.post("/messages", verifyToken, async (req, res) => {
//   try {
//     const { chatRoomId, receiverId, content } = req.body;
//     const senderId = req.userId; // Use req.userId from verifyToken
//     const message = await chatService.createMessage({
//       chatRoomId,
//       senderId,
//       receiverId,
//       content,
//     });
//     res.status(201).json(message);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

/**
 * @swagger
 * /api/chat/messages:
 *   get:
 *     summary: Get messages for a user or chat room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: chatRoomId
 *         schema:
 *           type: integer
 *         description: ID of the chat room (optional, if not provided, returns direct messages)
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
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   chatRoomId:
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
 *                   ChatRoom:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.get("/messages", verifyToken, async (req, res) => {
  try {
    const { chatRoomId, limit = 50, offset = 0 } = req.query;
    const userId = req.userId; // Use req.userId from verifyToken
    const messages = await chatService.getMessages({
      chatRoomId: chatRoomId ? parseInt(chatRoomId) : null,
      userId,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

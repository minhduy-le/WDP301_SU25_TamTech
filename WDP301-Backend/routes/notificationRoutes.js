// WDP301-Backend/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const notificationService = require("../services/notificationService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send a push notification to a user's mobile device
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - fcmToken
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               message:
 *                 type: string
 *                 maxLength: 255
 *               fcmToken:
 *                 type: string
 *                 maxLength: 1000
 *               data:
 *                 type: object
 *                 description: Optional data payload for custom handling in the mobile app
 *                 additionalProperties: true
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { title, message, fcmToken, data } = req.body;
    const result = await notificationService.sendNotification({
      title,
      message,
      fcmToken,
      data,
    });
    res.status(result.status).json({
      status: result.status,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in /send route:", error, error.stack);
    if (typeof error === "string") {
      res.status(400).send(error);
    } else {
      res.status(500).send("Server error");
    }
  }
});

/**
 * @swagger
 * /api/notifications/user/{userId}:
 *   get:
 *     summary: Get all notifications for a user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await notificationService.getUserNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in /user/:userId route:", error, error.stack);
    if (typeof error === "string") {
      if (error === "User not found") {
        res.status(404).send(error);
      } else {
        res.status(400).send(error);
      }
    } else {
      res.status(500).send("Server error");
    }
  }
});

module.exports = router;
// WDP301-Backend/routes/notificationRoutes.js

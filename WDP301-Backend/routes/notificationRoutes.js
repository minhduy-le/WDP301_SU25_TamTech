// WDP301-Backend/routes/notificationRoutes.js

const express = require("express");
const router = express.Router();
const notificationService = require("../services/notificationService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Endpoints for managing push notifications
 */

/**
 * @swagger
 * /api/notifications/save-token:
 *   post:
 *     summary: Save or update FCM token for a user
 *     description: Save the Firebase Cloud Messaging token for push notifications. This allows the server to send notifications to the user's device.
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
 *               - fcmToken
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 description: The FCM token from the client device.
 *     responses:
 *       200:
 *         description: FCM token saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input (e.g., missing token).
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.post("/save-token", verifyToken, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.userId;
    const result = await notificationService.saveFcmToken(userId, fcmToken);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in /save-token route:", error.message);
    if (error.message === "User not found") {
      res.status(404).send(error.message);
    } else {
      res.status(400).send(error.message);
    }
  }
});

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send a push notification to a specific user
 *     description: Manually send a push notification to a user with the specified ID. This is typically used for administrative purposes.
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
 *               - userId
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: The ID of the user to send the notification to.
 *               title:
 *                 type: string
 *                 description: The title of the notification.
 *               message:
 *                 type: string
 *                 description: The message content of the notification.
 *     responses:
 *       200:
 *         description: Notification sent successfully.
 *       400:
 *         description: Invalid input or no FCM token found for the user.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 */
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    const result = await notificationService.sendNotificationToUser(userId, title, message);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in /send route:", error.message);
    res.status(400).send(error.message);
  }
});

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications for the authenticated user
 *     description: Retrieves a list of recent notifications for the currently logged-in user.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of notifications for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Server error.
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await notificationService.getNotificationsByUserId(req.userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in GET /notifications route:", error.message);
    res.status(400).send(error.message);
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The notification ID.
 *         userId:
 *           type: integer
 *           description: The ID of the user who received the notification.
 *         title:
 *           type: string
 *           description: The title of the notification.
 *         message:
 *           type: string
 *           description: The body content of the notification.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the notification was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the notification was last updated.
 */

module.exports = router;

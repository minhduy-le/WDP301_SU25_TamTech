// WDP301-Backend/routes/notificationRoutes.js

const express = require("express");
const router = express.Router();
const notificationService = require("../services/notificationService");
const verifyToken = require("../middlewares/verifyToken");

// ... (existing POST /save-token and POST /send routes)

/**
 * @swagger
 * /api/notifications:
 * get:
 * summary: Get notifications for the authenticated user
 * tags: [Notifications]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: List of notifications for the user
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Notification'
 * 401:
 * description: Unauthorized
 * 500:
 * description: Server error
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
 * schemas:
 * Notification:
 * type: object
 * properties:
 * id:
 * type: integer
 * userId:
 * type: integer
 * title:
 * type: string
 * message:
 * type: string
 * createdAt:
 * type: string
 * format: date-time
 * updatedAt:
 * type: string
 * format: date-time
 */
module.exports = router;

const express = require("express");
const router = express.Router();
const feedbackService = require("../services/feedbackService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/feedback/{orderId}:
 *   post:
 *     summary: Create feedback for an order
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *               - rating
 *             properties:
 *               comment:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: Great order, really enjoyed the products!
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedback:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderId:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     comment:
 *                       type: string
 *                     rating:
 *                       type: integer
 *                     isResponsed:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input or feedback already exists
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 invalidOrderId: { value: "Order ID must be a positive integer" }
 *                 invalidComment: { value: "Comment cannot be empty" }
 *                 commentTooLong: { value: "Comment cannot exceed 255 characters" }
 *                 invalidRating: { value: "Rating must be an integer between 1 and 5" }
 *                 alreadyFeedback: { value: "You have already provided feedback for this order" }
 *                 notAuthorized: { value: "Order not found or you are not authorized to provide feedback for this order" }
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/:orderId", verifyToken, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { comment, rating } = req.body;
    const userId = req.userId;

    const feedback = await feedbackService.createFeedback({
      orderId,
      userId,
      comment,
      rating,
    });

    res.status(201).json({ feedback });
  } catch (error) {
    console.error("Error creating feedback:", error);
    if (
      error.message.includes("Order ID") ||
      error.message.includes("Comment") ||
      error.message.includes("Rating") ||
      error.message.includes("already provided") ||
      error.message.includes("authorized")
    ) {
      res.status(400).send(error.message);
    } else {
      res.status(500).send(error.message);
    }
  }
});

/**
 * @swagger
 * /api/feedback/{orderId}:
 *   get:
 *     summary: Get feedback for an order
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Feedback retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedbacks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       orderId:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       rating:
 *                         type: integer
 *                       isResponsed:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       User:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           fullName:
 *                             type: string
 *                       FeedbackResponses:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             feedbackId:
 *                               type: integer
 *                             repliedBy:
 *                               type: integer
 *                             content:
 *                               type: string
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                             RepliedBy:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 fullName:
 *                                   type: string
 *       400:
 *         description: Invalid order ID
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Order ID must be a positive integer
 *       404:
 *         description: Order not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Order not found
 *       500:
 *         description: Server error
 */
router.get("/:orderId", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);

    const feedbacks = await feedbackService.getFeedbackByOrderId(orderId);

    res.status(200).json({ feedbacks });
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    if (error.message.includes("Order ID")) {
      res.status(400).send(error.message);
    } else if (error.message.includes("Order not found")) {
      res.status(404).send(error.message);
    } else {
      res.status(500).send(error.message);
    }
  }
});

/**
 * @swagger
 * /api/feedback/response/{feedbackId}:
 *   post:
 *     summary: Create a response to a feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Feedback ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: Thank you for your feedback!
 *     responses:
 *       201:
 *         description: Feedback response created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedbackResponse:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     feedbackId:
 *                       type: integer
 *                     repliedBy:
 *                       type: integer
 *                     content:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 invalidFeedbackId: { value: "Feedback ID must be a positive integer" }
 *                 invalidContent: { value: "Response content cannot be empty" }
 *                 contentTooLong: { value: "Response content cannot exceed 255 characters" }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Feedback not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Feedback not found
 *       500:
 *         description: Server error
 */
router.post("/response/:feedbackId", verifyToken, async (req, res) => {
  try {
    const feedbackId = parseInt(req.params.feedbackId);
    const { content } = req.body;
    const userId = req.userId;

    const feedbackResponse = await feedbackService.createFeedbackResponse({
      feedbackId,
      userId,
      content,
    });

    res.status(201).json({ feedbackResponse });
  } catch (error) {
    console.error("Error creating feedback response:", error);
    if (
      error.message.includes("Feedback ID") ||
      error.message.includes("Response content") ||
      error.message.includes("User")
    ) {
      res.status(400).send(error.message);
    } else if (error.message.includes("Feedback not found")) {
      res.status(404).send(error.message);
    } else {
      res.status(500).send(error.message);
    }
  }
});

module.exports = router;

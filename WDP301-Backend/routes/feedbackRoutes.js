const express = require("express");
const router = express.Router();
const feedbackService = require("../services/feedbackService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/feedback:
 *   get:
 *     summary: Get all feedbacks
 *     tags: [Feedback]
 *     responses:
 *       200:
 *         description: Feedbacks retrieved successfully
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
 *                       productId:
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
 *                       Product:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: integer
 *                           name:
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
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const feedbacks = await feedbackService.getAllFeedbacks();

    res.status(200).json({ feedbacks });
  } catch (error) {
    console.error("Error retrieving all feedbacks:", error);
    res.status(500).send(error.message);
  }
});

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Create feedback for multiple products in an order
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
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
 *               - feedbacks
 *             properties:
 *               feedbacks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - comment
 *                     - rating
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       minimum: 1
 *                       example: 2
 *                     comment:
 *                       type: string
 *                       minLength: 1
 *                       maxLength: 255
 *                       example: Great product, really enjoyed it!
 *                     rating:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 5
 *                       example: 5
 *     responses:
 *       201:
 *         description: Feedbacks created successfully
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
 *                       productId:
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
 *       400:
 *         description: Invalid input or feedback already exists
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 invalidOrderId: { value: "Order ID must be a positive integer" }
 *                 invalidProductId: { value: "Product ID must be a positive integer" }
 *                 invalidComment: { value: "Comment cannot be empty" }
 *                 commentTooLong: { value: "Comment cannot exceed 255 characters" }
 *                 invalidRating: { value: "Rating must be an integer between 1 and 5" }
 *                 alreadyFeedback: { value: "You have already provided feedback for this product in this order" }
 *                 notAuthorized: { value: "Order not found or you are not authorized to provide feedback for this order" }
 *                 productNotInOrder: { value: "Product not found in this order" }
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const orderId = parseInt(req.query.orderId);
    const feedbacksData = req.body.feedbacks;
    const userId = req.userId;

    if (!Number.isInteger(orderId) || orderId < 1) {
      return res.status(400).send("Order ID must be a positive integer");
    }

    if (!Array.isArray(feedbacksData) || feedbacksData.length === 0) {
      return res.status(400).send("Feedbacks array is required and cannot be empty");
    }

    const createdFeedbacks = await feedbackService.createMultipleFeedbacks({
      orderId,
      userId,
      feedbacks: feedbacksData,
    });

    res.status(201).json({ feedbacks: createdFeedbacks });
  } catch (error) {
    console.error("Error creating feedbacks:", error);
    if (
      error.message.includes("Order ID") ||
      error.message.includes("Product ID") ||
      error.message.includes("Comment") ||
      error.message.includes("Rating") ||
      error.message.includes("already provided") ||
      error.message.includes("authorized") ||
      error.message.includes("Product not found")
    ) {
      res.status(400).send(error.message);
    } else {
      res.status(500).send(error.message);
    }
  }
});

/**
 * @swagger
 * /api/feedback/{orderId}/{productId}:
 *   get:
 *     summary: Get feedback for a product in an order
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Order ID
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Product ID
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
 *                       productId:
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
 *                       Product:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: integer
 *                           name:
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
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 invalidOrderId: { value: "Order ID must be a positive integer" }
 *                 invalidProductId: { value: "Product ID must be a positive integer" }
 *                 productNotInOrder: { value: "Product not found in this order" }
 *       500:
 *         description: Server error
 */
router.get("/:orderId/:productId", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const productId = parseInt(req.params.productId);

    const feedbacks = await feedbackService.getFeedbackByProductAndOrder(orderId, productId);

    res.status(200).json({ feedbacks });
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    if (
      error.message.includes("Order ID") ||
      error.message.includes("Product ID") ||
      error.message.includes("Product not found")
    ) {
      res.status(400).send(error.message);
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

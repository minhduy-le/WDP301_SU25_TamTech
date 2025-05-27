const express = require("express");
const router = express.Router();
const feedbackService = require("../services/feedbackService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/feedback/{productId}:
 *   post:
 *     summary: Create feedback for a product
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Product ID
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
 *                 example: Great product, really enjoyed it!
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
 *                     productId:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     comment:
 *                       type: string
 *                     rating:
 *                       type: integer
 *                     isFeedback:
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
 *                 invalidProductId: { value: "Product ID must be a positive integer" }
 *                 invalidComment: { value: "Comment cannot be empty" }
 *                 commentTooLong: { value: "Comment cannot exceed 255 characters" }
 *                 invalidRating: { value: "Rating must be an integer between 1 and 5" }
 *                 alreadyFeedback: { value: "You have already provided feedback for this product" }
 *                 notPurchased: { value: "You can only provide feedback for products you have purchased" }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Product not found or inactive
 *       500:
 *         description: Server error
 */
router.post("/:productId", verifyToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { comment, rating } = req.body;
    const userId = req.userId;

    const feedback = await feedbackService.createFeedback({
      productId,
      userId,
      comment,
      rating,
    });

    res.status(201).json({ feedback });
  } catch (error) {
    console.error("Error creating feedback:", error);
    if (
      error.message.includes("Product ID") ||
      error.message.includes("Comment") ||
      error.message.includes("Rating") ||
      error.message.includes("already provided") ||
      error.message.includes("purchased")
    ) {
      res.status(400).send(error.message);
    } else if (error.message.includes("Product not found")) {
      res.status(404).send(error.message);
    } else {
      res.status(500).send(error.message);
    }
  }
});

/**
 * @swagger
 * /api/feedback/{productId}:
 *   get:
 *     summary: Get all feedback for a product
 *     tags: [Feedback]
 *     parameters:
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
 *                       productId:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       rating:
 *                         type: integer
 *                       isFeedback:
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
 *       400:
 *         description: Invalid product ID
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Product ID must be a positive integer
 *       404:
 *         description: Product not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Product not found or inactive
 *       500:
 *         description: Server error
 */
router.get("/:productId", async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    const feedbacks = await feedbackService.getFeedbackByProductId(productId);

    res.status(200).json({ feedbacks });
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    if (error.message.includes("Product ID")) {
      res.status(400).send(error.message);
    } else if (error.message.includes("Product not found")) {
      res.status(404).send(error.message);
    } else {
      res.status(500).send(error.message);
    }
  }
});

module.exports = router;

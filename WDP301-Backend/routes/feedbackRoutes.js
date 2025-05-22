const express = require("express");
const router = express.Router();
const feedbackService = require("../services/feedbackService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Create a new feedback
 *     description: Allows authenticated users to submit feedback for a product
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - comment
 *               - rating
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: ID of the product being reviewed
 *               comment:
 *                 type: string
 *                 description: Feedback comment (max 255 characters)
 *               rating:
 *                 type: integer
 *                 description: Rating from 1 to 5
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 feedback:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     productId:
 *                       type: integer
 *                     comment:
 *                       type: string
 *                     rating:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { productId, comment, rating } = req.body;
    const userId = req.userId; // Obtained from verifyToken
    const feedback = await feedbackService.createFeedback({
      userId,
      productId,
      comment,
      rating,
    });
    res.status(201).json({ message: "Feedback created successfully", feedback });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

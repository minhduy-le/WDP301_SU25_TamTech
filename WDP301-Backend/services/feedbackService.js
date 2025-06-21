const Feedback = require("../models/feedback");
const FeedbackResponse = require("../models/FeedbackResponse");
const Order = require("../models/order");
const User = require("../models/user");

const feedbackService = {
  async createFeedback({ orderId, userId, comment, rating }) {
    if (!Number.isInteger(orderId) || orderId < 1) {
      throw new Error("Order ID must be a positive integer");
    }
    if (!Number.isInteger(userId) || userId < 1) {
      throw new Error("User ID must be a positive integer");
    }
    if (!comment || typeof comment !== "string" || comment.trim() === "") {
      throw new Error("Comment cannot be empty");
    }
    if (comment.length > 255) {
      throw new Error("Comment cannot exceed 255 characters");
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error("Rating must be an integer between 1 and 5");
    }

    const order = await Order.findOne({
      where: { orderId, userId },
      include: [],
    });
    if (!order) {
      throw new Error("Order not found or you are not authorized to provide feedback for this order");
    }

    const existingFeedback = await Feedback.findOne({
      where: { orderId, userId },
    });
    if (existingFeedback) {
      throw new Error("You have already provided feedback for this order");
    }

    const feedback = await Feedback.create({
      orderId,
      userId,
      comment: comment.trim(),
      rating,
      isResponsed: false, // Set isResponsed to false on creation
    });

    return feedback;
  },

  async getFeedbackByOrderId(orderId) {
    if (!Number.isInteger(orderId) || orderId < 1) {
      throw new Error("Order ID must be a positive integer");
    }

    const order = await Order.findByPk(orderId, { attributes: ["orderId"] });
    if (!order) {
      throw new Error("Order not found");
    }

    const feedbacks = await Feedback.findAll({
      where: { orderId },
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "fullName"],
        },
        {
          model: FeedbackResponse,
          as: "FeedbackResponses",
          include: [
            {
              model: User,
              as: "RepliedBy",
              attributes: ["id", "fullName"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return feedbacks;
  },

  async createFeedbackResponse({ feedbackId, userId, content }) {
    if (!Number.isInteger(feedbackId) || feedbackId < 1) {
      throw new Error("Feedback ID must be a positive integer");
    }
    if (!Number.isInteger(userId) || userId < 1) {
      throw new Error("User ID must be a positive integer");
    }
    if (!content || typeof content !== "string" || content.trim() === "") {
      throw new Error("Response content cannot be empty");
    }
    if (content.length > 255) {
      throw new Error("Response content cannot exceed 255 characters");
    }

    const feedback = await Feedback.findByPk(feedbackId);
    if (!feedback) {
      throw new Error("Feedback not found");
    }

    const user = await User.findByPk(userId);
    if (!user || user.isBan || !user.isActive) {
      throw new Error("User not found or unauthorized to respond");
    }

    const feedbackResponse = await FeedbackResponse.create({
      feedbackId,
      repliedBy: userId,
      content: content.trim(),
    });

    // Update isResponsed to true
    await feedback.update({ isResponsed: true });

    return feedbackResponse;
  },
};

module.exports = feedbackService;

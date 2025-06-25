const Feedback = require("../models/feedback");
const FeedbackResponse = require("../models/FeedbackResponse");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const User = require("../models/user");
const Product = require("../models/product");

const feedbackService = {
  async createFeedback({ orderId, productId, userId, comment, rating }) {
    if (!Number.isInteger(orderId) || orderId < 1) {
      throw new Error("Order ID must be a positive integer");
    }
    if (!Number.isInteger(productId) || productId < 1) {
      throw new Error("Product ID must be a positive integer");
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

    // Verify the order belongs to the user
    const order = await Order.findOne({
      where: { orderId, userId },
      attributes: ["orderId"],
    });
    if (!order) {
      throw new Error("Order not found or you are not authorized to provide feedback for this order");
    }

    // Verify the product exists in the order
    const orderItem = await OrderItem.findOne({
      where: { orderId, productId },
      attributes: ["orderItemId"],
    });
    if (!orderItem) {
      throw new Error("Product not found in this order");
    }

    // Check for existing feedback for this product in this order
    const existingFeedback = await Feedback.findOne({
      where: { orderId, productId, userId },
    });
    if (existingFeedback) {
      throw new Error("You have already provided feedback for this product in this order");
    }

    const feedback = await Feedback.create({
      orderId,
      productId,
      userId,
      comment: comment.trim(),
      rating,
      isResponsed: false,
    });

    return feedback;
  },

  async getFeedbackByProductAndOrder(orderId, productId) {
    if (!Number.isInteger(orderId) || orderId < 1) {
      throw new Error("Order ID must be a positive integer");
    }
    if (!Number.isInteger(productId) || productId < 1) {
      throw new Error("Product ID must be a positive integer");
    }

    // Verify the order and product exist
    const orderItem = await OrderItem.findOne({
      where: { orderId, productId },
      attributes: ["orderItemId"],
    });
    if (!orderItem) {
      throw new Error("Product not found in this order");
    }

    const feedbacks = await Feedback.findAll({
      where: { orderId, productId },
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
        {
          model: Product,
          as: "Product",
          attributes: ["productId", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return feedbacks;
  },

  async getAllFeedbacks() {
    const feedbacks = await Feedback.findAll({
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
        {
          model: Product,
          as: "Product",
          attributes: ["productId", "name"],
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

    await feedback.update({ isResponsed: true });

    return feedbackResponse;
  },
};

module.exports = feedbackService;

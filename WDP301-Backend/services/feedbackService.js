const Feedback = require("../models/feedback");
const Product = require("../models/product");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");

const feedbackService = {
  async createFeedback({ productId, userId, comment, rating }) {
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

    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      throw new Error("Product not found or inactive");
    }

    const order = await Order.findOne({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
          where: { productId },
          required: true,
        },
      ],
    });
    if (!order) {
      throw new Error("You can only provide feedback for products you have purchased");
    }

    const existingFeedback = await Feedback.findOne({
      where: { productId, userId },
    });
    if (existingFeedback) {
      throw new Error("You have already provided feedback for this product");
    }

    const feedback = await Feedback.create({
      productId,
      userId,
      comment: comment.trim(),
      rating,
      isFeedback: true,
    });

    return feedback;
  },

  async getFeedbackByProductId(productId) {
    if (!Number.isInteger(productId) || productId < 1) {
      throw new Error("Product ID must be a positive integer");
    }

    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      throw new Error("Product not found or inactive");
    }

    const feedbacks = await Feedback.findAll({
      where: { productId, isFeedback: true },
      include: [
        {
          model: require("../models/user"),
          as: "User",
          attributes: ["id", "fullName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return feedbacks;
  },
};

module.exports = feedbackService;

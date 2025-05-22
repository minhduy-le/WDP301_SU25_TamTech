const Feedback = require("../models/feedback");
const User = require("../models/user");
const Product = require("../models/product");
const httpErrors = require("http-errors");

const createFeedback = async ({ userId, productId, comment, rating }) => {
  // Validate input
  if (!userId || !productId || !comment || !rating) {
    throw httpErrors.BadRequest("Missing required fields");
  }

  // Check if rating is between 1 and 5
  if (rating < 1 || rating > 5) {
    throw httpErrors.BadRequest("Rating must be between 1 and 5");
  }

  // Check if user exists
  const user = await User.findByPk(userId);
  if (!user) {
    throw httpErrors.NotFound("User not found");
  }

  // Check if product exists
  const product = await Product.findByPk(productId);
  if (!product) {
    throw httpErrors.NotFound("Product not found");
  }

  // Create feedback
  const feedback = await Feedback.create({
    userId,
    productId,
    comment,
    rating,
  });

  return feedback;
};

module.exports = {
  createFeedback,
  //   getFeedbackByProductId,
};

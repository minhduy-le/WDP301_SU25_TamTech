const User = require("../models/user");
const Order = require("../models/order");
const httpErrors = require("http-errors");

const getShippers = async () => {
  const shippers = await User.findAll({
    where: { role: "Shipper" },
    attributes: ["id", "fullName", "email", "phone_number"],
  });
  return shippers;
};

const assignShipperToOrder = async (orderId, shipperId) => {
  // Validate inputs
  if (!orderId || !shipperId) {
    throw httpErrors.BadRequest("Order ID and Shipper ID are required");
  }

  // Check if order exists
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw httpErrors.NotFound("Order not found");
  }

  // Check if shipper exists and has role "Shipper"
  const shipper = await User.findByPk(shipperId);
  if (!shipper || shipper.role !== "Shipper") {
    throw httpErrors.BadRequest("Invalid shipper ID or user is not a shipper");
  }

  // Update order with assignToShipperId
  order.assignToShipperId = shipperId;
  await order.save();

  return {
    message: "Shipper assigned successfully",
    orderId: order.orderId,
    shipperId: shipperId,
  };
};

module.exports = {
  getShippers,
  assignShipperToOrder,
};

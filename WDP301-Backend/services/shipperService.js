const User = require("../models/user");
const Order = require("../models/order");
const httpErrors = require("http-errors");
const notificationService = require("./notificationService");

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
  // Đồng thời lấy fcmToken của shipper
  const shipper = await User.findOne({
    where: { id: shipperId, role: "Shipper" },
  });

  if (!shipper) {
    throw httpErrors.BadRequest("Invalid shipper ID or user is not a shipper");
  }

  // Update order with assignToShipperId
  order.assignToShipperId = shipperId;
  await order.save();

  // Gửi thông báo cho shipper sau khi gán đơn thành công
  if (shipper.fcmToken) {
    try {
      await notificationService.sendNotification({
        title: "Bạn có đơn hàng mới!",
        message: `Bạn vừa được chỉ định giao đơn hàng #${order.orderId}. Vui lòng kiểm tra ứng dụng.`,
        fcmToken: shipper.fcmToken,
        data: {
          orderId: order.orderId.toString(),
          screen: "NewDeliveryAssignment", // Gợi ý cho app di động điều hướng đến màn hình cụ thể
        },
      });
      console.log(`Notification sent to shipper ${shipper.id} for order ${order.orderId}`);
    } catch (notificationError) {
      // Ghi lại lỗi nhưng không làm gián đoạn luồng chính
      console.error(`Failed to send notification to shipper ${shipper.id}:`, notificationError.message);
    }
  } else {
    console.log(`Shipper ${shipper.id} does not have an FCM token. Skipping notification.`);
  }

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

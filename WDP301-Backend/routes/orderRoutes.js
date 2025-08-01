const express = require("express");
const router = express.Router();
const {
  createOrder,
  handlePaymentSuccess,
  getUserOrders,
  setOrderToApproved,
  setOrderToPreparing,
  setOrderToCooked,
  setOrderToDelivering,
  setOrderToDelivered,
  getAllOrders,
  getPaidOrders,
  getOrderDetails,
  sendRefundEmail,
  setOrderToCanceled,
  uploadRefundCertification,
  getLatestOrder,
  setOrderToCanceledWhenUserCancel,
} = require("../services/orderService");
const verifyToken = require("../middlewares/verifyToken");
const Order = require("../models/order");
const Information = require("../models/information");
const axios = require("axios");
const sequelize = require("../config/database");
const { generateAndUploadInvoice } = require("../services/orderService");
require("dotenv").config();
const multer = require("multer");

const provinceMapping = {
  TPHCM: "TP. Hồ Chí Minh",
  HCM: "TP. Hồ Chí Minh",
  "Hồ Chí Minh": "TP. Hồ Chí Minh",
  "TP. HCM": "TP. Hồ Chí Minh",
  "Thành Phố Hồ Chí Minh": "TP. Hồ Chí Minh",
  "Hà Nội": "TP. Hà Nội",
  HN: "TP. Hà Nội",
  "TP Hà Nội": "TP. Hà Nội",
  "Đà Nẵng": "TP. Đà Nẵng",
  DN: "TP. Đà Nẵng",
  "Cần Thơ": "TP. Cần Thơ",
  "Hải Phòng": "TP. Hải Phòng",
};

const upload = multer({ storage: multer.memoryStorage() });

const standardizeProvince = (province) => {
  if (!province) return "TP. Hồ Chí Minh";
  const normalizedProvince = province.trim().toUpperCase();
  return provinceMapping[normalizedProvince] || provinceMapping[province] || province;
};

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderItems
 *               - order_shipping_fee
 *               - payment_method_id
 *               - order_address
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                     - price
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       description: ID of the product
 *                     quantity:
 *                       type: integer
 *                       description: Quantity of the product
 *                     price:
 *                       type: number
 *                       description: Price per unit of the product
 *               order_discount_value:
 *                 type: number
 *                 description: Discount value applied to the order
 *                 nullable: true
 *               promotion_code:
 *                 type: string
 *                 description: Code of the promotion applied to the order
 *                 nullable: true
 *                 example: "SUMMER2025"
 *               order_shipping_fee:
 *                 type: number
 *                 description: Shipping fee for the order
 *               payment_method_id:
 *                 type: integer
 *                 description: "Payment method ID (1 for Vnpay, 2 for Momo, 3 for Zalopay, 4 for PayOS)"
 *               order_address:
 *                 type: string
 *                 description: Delivery address for the order
 *               platform:
 *                 type: string
 *                 description: Platform from which the order is placed (web or mobile)
 *               note:
 *                 type: string
 *                 description: Optional note for the order (e.g., special delivery instructions)
 *                 nullable: true
 *                 example: "Vui lòng giao sau 5 giờ chiều"
 *               isDatHo:
 *                 type: boolean
 *                 description: Indicates if the order is placed on behalf
 *                 default: false
 *               tenNguoiDatHo:
 *                 type: string
 *                 description: Name of the person placing the order on behalf
 *                 nullable: true
 *               soDienThoaiNguoiDatHo:
 *                 type: string
 *                 description: Phone number of the person placing the order on behalf
 *                 nullable: true
 *               customerId:
 *                 type: integer
 *                 description: ID of the customer (if different from the authenticated user)
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 orderId:
 *                   type: integer
 *                 checkoutUrl:
 *                   type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Order items must be an array"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: integer
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to create order"
 */
router.post("/", verifyToken, createOrder);

/**
 * @swagger
 * /api/orders/payment-success:
 *   get:
 *     summary: Xử lý callback thanh toán thành công
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của đơn hàng
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: >
 *           Mã kết quả thanh toán (ví dụ: "00" cho thành công)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: >
 *           Trạng thái thanh toán (ví dụ: "PAID")
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID giao dịch từ cổng thanh toán
 *       - in: query
 *         name: cancel
 *         schema:
 *           type: string
 *         required: true
 *         description: Trạng thái hủy giao dịch (true/false)
 *     responses:
 *       302:
 *         description: Chuyển hướng đến frontend với trạng thái thành công hoặc thất bại
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ hoặc đơn hàng đã được xử lý
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Đơn hàng đã được xử lý hoặc ở trạng thái không hợp lệ
 *       404:
 *         description: Không tìm thấy đơn hàng
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Không tìm thấy đơn hàng với ID 349
 *       500:
 *         description: Lỗi máy chủ
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Lỗi khi xử lý xác nhận thanh toán
 */
router.get("/payment-success", handlePaymentSuccess);

/**
 * @swagger
 * /api/order/payment-cancel:
 *   get:
 *     summary: Handle payment cancellation
 *     description: Process the cancellation of an order payment and return the status.
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the order to cancel
 *     responses:
 *       200:
 *         description: Payment cancellation processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Payment cancelled"
 *       400:
 *         description: Missing orderId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order ID is required"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Order not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to process cancellation"
 */
router.get("/payment-cancel", async (req, res) => {
  const { orderId } = req.query;
  if (!orderId) {
    console.log("Missing orderId in payment-cancel callback");
    return res.status(400).json({ message: "Order ID is required" });
  }
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      console.log("Order not found for orderId:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }
    console.log("Payment cancelled for orderId:", orderId);
    res.status(200).json({ message: "Payment cancelled" });
  } catch (error) {
    console.log("Error in payment-cancel callback:", error.message);
    res.status(500).json({ message: "Failed to process cancellation", error: error.message });
  }
});

/**
 * @swagger
 * /api/orders/user:
 *   get:
 *     summary: Retrieve orders for the authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   orderId:
 *                     type: integer
 *                   payment_time:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                   order_create_at:
 *                     type: string
 *                     format: date-time
 *                   order_address:
 *                     type: string
 *                   status:
 *                     type: string
 *                     description: Order status (e.g., Pending, Paid, Approved, Preparing, Cooked, Delivering, Delivered)
 *                   fullName:
 *                     type: string
 *                     description: User's full name
 *                   phone_number:
 *                     type: string
 *                     nullable: true
 *                   orderItems:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         productId:
 *                           type: integer
 *                         name:
 *                           type: string
 *                           description: Product name
 *                         quantity:
 *                           type: integer
 *                         price:
 *                           type: number
 *                   orderItemsCount:
 *                     type: integer
 *                     description: Total number of order items in the order
 *                   order_shipping_fee:
 *                     type: number
 *                   order_discount_value:
 *                     type: number
 *                   order_amount:
 *                     type: number
 *                   invoiceUrl:
 *                     type: string
 *                     nullable: true
 *                   order_point_earn:
 *                     type: integer
 *                   note:
 *                     type: string
 *                     nullable: true
 *                   payment_method:
 *                     type: string
 *                     description: Payment method name (e.g., Vnpay, PayOS)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/user", verifyToken, getUserOrders);

/**
 * @swagger
 * /api/orders/success:
 *   get:
 *     summary: Handle successful payment callback (GET)
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the order
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Payment status code from PayOS
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Payment status from PayOS
 *     responses:
 *       302:
 *         description: Redirects to frontend payment success page
 *       400:
 *         description: Invalid input
 *   post:
 *     summary: Handle successful payment callback (POST)
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Payment status code from PayOS
 *               status:
 *                 type: string
 *                 description: Payment status from PayOS
 *     responses:
 *       302:
 *         description: Redirects to frontend payment success page
 *       400:
 *         description: Invalid input
 */
router.get("/success", handlePaymentSuccess);
router.post("/success", handlePaymentSuccess);

/**
 * @swagger
 * /api/orders/cancel:
 *   get:
 *     summary: Handle payment cancellation callback
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the order
 *     responses:
 *       200:
 *         description: Payment cancelled
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get("/cancel", async (req, res) => {
  const { orderId } = req.query;
  if (!orderId) {
    console.log("Missing orderId in cancel callback");
    return res.status(400).json({ message: "Order ID is required" });
  }
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      console.log("Order not found for orderId:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }
    console.log("Payment cancelled for orderId:", orderId);
    res.status(200).json({ message: "Payment cancelled" });
  } catch (error) {
    console.log("Error in cancel callback:", error.message);
    res.status(500).json({ message: "Failed to process cancellation", error: error.message });
  }
});

/**
 * @swagger
 * /api/orders/{orderId}/cancel:
 *   put:
 *     summary: Cancel an existing order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the order to cancel
 *     responses:
 *       200:
 *         description: Order canceled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order canceled successfully
 *       400:
 *         description: Order cannot be canceled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Only pending orders can be canceled
 *       404:
 *         description: Order not found or user lacks permission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found or you don't have permission
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.put("/:orderId/cancel", verifyToken, async (req, res) => {
  const { orderId } = req.params;
  const userId = req.userId;

  const result = await setOrderToCanceledWhenUserCancel(parseInt(orderId), userId);
  return res.status(result.status).json({ message: result.message });
});

/**
 * @swagger
 * /api/orders/webhook:
 *   post:
 *     summary: Handle PayOS webhook for payment status updates
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderCode
 *               - status
 *               - code
 *             properties:
 *               orderCode:
 *                 type: integer
 *                 description: The order ID
 *               status:
 *                 type: string
 *                 description: Payment status (e.g., PAID, CANCELLED)
 *               code:
 *                 type: string
 *                 description: Payment status code from PayOS
 *     responses:
 *       200:
 *         description: Webhook processed
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post("/webhook", async (req, res) => {
  console.log("PayOS webhook received at:", new Date().toISOString());
  console.log("Webhook headers:", JSON.stringify(req.headers, null, 2));
  console.log("Webhook body:", JSON.stringify(req.body, null, 2));
  const { orderCode, status, code } = req.body;
  if (!orderCode) {
    console.log("Missing orderCode in webhook");
    return res.status(400).json({ message: "Order code is required" });
  }
  try {
    const order = await Order.findOne({ where: { orderId: orderCode } });
    if (!order) {
      console.log("Order not found for orderCode:", orderCode);
      return res.status(404).json({ message: "Order not found" });
    }
    if (status === "PAID" && code === "00") {
      console.log("Webhook updating status_id to 2 for orderId:", orderCode);
      order.status_id = 2; // Paid
      order.payment_time = new Date();

      const user = await User.findOne({ where: { id: order.userId } });
      if (user) {
        const currentMemberPoint = user.member_point || 0;
        const orderPointEarn = order.order_point_earn || 0;
        user.member_point = currentMemberPoint + orderPointEarn;
        console.log(`Updated user ${user.id} member_point to ${user.member_point}`);
        await user.save();
      }

      const transaction = await sequelize.transaction();
      try {
        const invoiceUrl = await generateAndUploadInvoice(order, orderCode, transaction);
        order.invoiceUrl = invoiceUrl;
        await order.save({ transaction });
        await transaction.commit();
        console.log("Invoice generated and saved for orderId:", orderCode, "Invoice URL:", invoiceUrl);
      } catch (error) {
        await transaction.rollback();
        console.error("Error generating invoice for orderId:", orderCode, error.message);
        return res.status(500).json({ message: "Failed to generate invoice", error: error.message });
      }
    } else {
      console.log("Webhook skipped: Payment not successful", { status, code });
    }
    res.status(200).json({ message: "Webhook processed" });
  } catch (error) {
    console.error("Error in webhook:", error.message, error.stack);
    res.status(500).json({ message: "Failed to process webhook", error: error.message });
  }
});

/**
 * @swagger
 * /api/orders/shipping/calculate:
 *   post:
 *     summary: Calculate shipping fee and save address
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliver_address
 *             properties:
 *               deliver_address:
 *                 type: string
 *                 example: "123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM"
 *               weight:
 *                 type: number
 *                 example: 1000
 *                 description: Weight of the package in grams
 *     responses:
 *       200:
 *         description: Shipping fee calculated and address saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 fee:
 *                   type: number
 *                 insurance_fee:
 *                   type: number
 *                 total_fee:
 *                   type: number
 *       400:
 *         description: Missing required fields or invalid address
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/shipping/calculate", verifyToken, async (req, res) => {
  try {
    const { deliver_address, weight } = req.body;

    if (!deliver_address) {
      return res.status(400).json({
        status: 400,
        message: "Missing required field: deliver_address",
      });
    }

    const addressRegex = /^[^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+$/;
    if (!addressRegex.test(deliver_address)) {
      return res.status(400).json({
        status: 400,
        message: "Delivery address must be in the format: street name, ward, district, city",
      });
    }

    const defaultWeight = weight || 1000;

    const pickProvince = "TP. Hồ Chí Minh";
    const pickDistrict = "Quận 3";
    const pickWard = "Phường 1";
    const pickAddress = "643 Điện Biên Phủ";

    const addressParts = deliver_address.split(",").map((part) => part.trim());
    const [street, ward, district, province] = addressParts;

    const deliverAddress = street;
    let deliverWard = ward;
    let deliverDistrict = district;
    let deliverProvince = province;

    deliverProvince = standardizeProvince(deliverProvince);

    if (deliverProvince !== "TP. Hồ Chí Minh") {
      return res.status(400).json({
        status: 400,
        message: "Delivery is only available within Ho Chi Minh City (TP. Hồ Chí Minh)",
      });
    }

    console.log("Parsed Address:", { deliverProvince, deliverDistrict, deliverWard, deliverAddress });

    const ghtkApiUrl = process.env.GHTK_API_BASE_URL + "/services/shipment/fee";
    const queryParams = {
      pick_province: pickProvince,
      pick_district: pickDistrict,
      pick_ward: pickWard,
      pick_address: pickAddress,
      province: deliverProvince,
      district: deliverDistrict,
      ward: deliverWard,
      address: deliverAddress,
      weight: defaultWeight,
      value: 500000,
      deliver_option: "xteam",
      transport: "road",
    };
    console.log("GHTK Query Params:", queryParams);

    const response = await axios.get(ghtkApiUrl, {
      params: queryParams,
      headers: {
        Token: process.env.GHTK_API_TOKEN,
      },
    });

    console.log("GHTK API Response:", response.data);
    if (response.data.success === false) {
      throw new Error(`GHTK Error: ${response.data.message || "Unknown error"}`);
    }

    const shippingFee = response.data.fee && response.data.fee.fee ? response.data.fee.fee : 0;
    const insuranceFee = response.data.fee && response.data.fee.insurance_fee ? response.data.fee.insurance_fee : 0;
    const totalFee = shippingFee + insuranceFee;

    if (shippingFee === 0) {
      console.warn("Warning: GHTK returned zero shipping fee, possible invalid data.");
    }

    const newAddress = await Information.create({
      userId: req.userId,
      address: deliver_address,
    });

    res.status(200).json({
      status: 200,
      message: "Shipping fee calculated and address saved successfully",
      fee: shippingFee,
      insurance_fee: insuranceFee,
      total_fee: totalFee,
    });
  } catch (error) {
    console.error("Error calculating shipping fee:", error);
    if (error.response) {
      console.error("GHTK API Error:", error.response.data);
    }
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Retrieve details of a specific order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order
 *     responses:
 *       200:
 *         description: Details of the specified order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 payment_time:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 order_create_at:
 *                   type: string
 *                   format: date-time
 *                 order_address:
 *                   type: string
 *                 status:
 *                   type: string
 *                   description: Order status (e.g., Pending, Paid, Approved, Preparing, Cooked, Delivering, Delivered)
 *                 fullName:
 *                   type: string
 *                   description: User's full name
 *                 phone_number:
 *                   type: string
 *                   nullable: true
 *                 orderItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                         description: Product name
 *                       quantity:
 *                         type: integer
 *                       price:
 *                         type: number
 *                 orderItemsCount:
 *                   type: integer
 *                   description: Total number of order items in the order
 *                 order_shipping_fee:
 *                   type: number
 *                 order_discount_value:
 *                   type: number
 *                 order_amount:
 *                   type: number
 *                 order_subtotal:
 *                   type: number
 *                 invoiceUrl:
 *                   type: string
 *                   nullable: true
 *                 order_point_earn:
 *                   type: integer
 *                 note:
 *                   type: string
 *                   nullable: true
 *                 payment_method:
 *                   type: string
 *                   description: Payment method name (e.g., Vnpay, PayOS)
 *                 isDatHo:
 *                   type: boolean
 *                   description: Indicates if the order is placed on behalf
 *                 tenNguoiDatHo:
 *                   type: string
 *                   description: Name of the person placing the order on behalf
 *                   nullable: true
 *                 soDienThoaiNguoiDatHo:
 *                   type: string
 *                   description: Phone number of the person placing the order on behalf
 *                   nullable: true
 *                 certificationOfDelivered:
 *                   type: string
 *                   description: URL of the certification image for delivered orders
 *                   nullable: true
 *                 order_delivery_at:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp when the order was delivered
 *                   nullable: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: integer
 *       403:
 *         description: Forbidden (user not allowed to access this order)
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Unauthorized: You do not have permission to view this order'
 *       404:
 *         description: Order not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Order not found'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get("/:orderId", verifyToken, getOrderDetails);

/**
 * @swagger
 * /api/orders/latest/order:
 *   get:
 *     summary: Retrieve the latest order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Details of the latest order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 payment_time:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 order_create_at:
 *                   type: string
 *                   format: date-time
 *                 order_address:
 *                   type: string
 *                 status:
 *                   type: string
 *                 fullName:
 *                   type: string
 *                 phone_number:
 *                   type: string
 *                   nullable: true
 *                 orderItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       price:
 *                         type: number
 *                 orderItemsCount:
 *                   type: integer
 *                 order_shipping_fee:
 *                   type: number
 *                 order_discount_value:
 *                   type: number
 *                 order_amount:
 *                   type: number
 *                 invoiceUrl:
 *                   type: string
 *                   nullable: true
 *                 order_point_earn:
 *                   type: integer
 *                 note:
 *                   type: string
 *                   nullable: true
 *                 payment_method:
 *                   type: string
 *       404:
 *         description: No order found
 *       500:
 *         description: Server error
 */
router.get("/latest/order", verifyToken, getLatestOrder);

/**
 * @swagger
 * /api/orders/{orderId}/approved:
 *   put:
 *     summary: Set order status to Approved
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order
 *     responses:
 *       200:
 *         description: Order status updated to Approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 orderId:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   example: Approved
 *       400:
 *         description: Invalid input or invalid status transition
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Invalid status transition: Order is currently Pending. It must be Paid to transition to Approved.'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: integer
 *       403:
 *         description: Forbidden (user role not allowed)
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Unauthorized: Only Staff or Admin can set orders to Approved'
 *       404:
 *         description: Order not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Order not found'
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Failed to update order status'
 */
router.put("/:orderId/approved", verifyToken, setOrderToApproved);

/**
 * @swagger
 * /api/orders/preparing:
 *   put:
 *     summary: Set status to "Preparing" for multiple orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderIds
 *             properties:
 *               orderIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: A list of order IDs to update
 *                 example: [101, 102, 105]
 *     responses:
 *       200:
 *         description: Batch update complete. Response includes counts and details of success/failures.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 successCount:
 *                   type: integer
 *                 failureCount:
 *                   type: integer
 *                 updatedOrderIds:
 *                   type: array
 *                   items:
 *                     type: integer
 *                 failedOrders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderId:
 *                         type: integer
 *                       reason:
 *                         type: string
 *       400:
 *         description: Invalid request body
 *       403:
 *         description: Forbidden (user role not allowed)
 *       500:
 *         description: Server error
 */
router.put("/preparing", verifyToken, setOrderToPreparing);

/**
 * @swagger
 * /api/orders/cooked:
 *   put:
 *     summary: Set status to "Cooked" for multiple orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderIds
 *             properties:
 *               orderIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: A list of order IDs to update
 *                 example: [101, 102]
 *     responses:
 *       200:
 *         description: Batch update complete. Response includes counts and details of successes and failures.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 successCount:
 *                   type: integer
 *                 failureCount:
 *                   type: integer
 *                 updatedOrderIds:
 *                   type: array
 *                   items:
 *                     type: integer
 *                 failedOrders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderId:
 *                         type: integer
 *                       reason:
 *                         type: string
 *       400:
 *         description: Invalid request body or invalid status transition
 *       403:
 *         description: Forbidden (user role not allowed)
 *       500:
 *         description: Server error
 */
router.put("/cooked", verifyToken, setOrderToCooked);

/**
 * @swagger
 * /api/orders/{orderId}/delivering:
 *   put:
 *     summary: Set order status to Delivering
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order
 *     responses:
 *       200:
 *         description: Order status updated to Delivering
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 orderId:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   example: Delivering
 *       400:
 *         description: Invalid input or invalid status transition
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Invalid status transition: Order is currently Preparing. It must be Cooked to transition to Delivering.'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: integer
 *       403:
 *         description: Forbidden (user role not allowed)
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Unauthorized: Only Staff or Shipper can set orders to Delivering'
 *       404:
 *         description: Order not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Order not found'
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Failed to update order status'
 */
router.put("/:orderId/delivering", verifyToken, setOrderToDelivering);

/**
 * @swagger
 * /api/orders/{orderId}/delivered:
 *   put:
 *     summary: Set order status to Delivered
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Certification image (JPEG or PNG) confirming delivery
 *     responses:
 *       200:
 *         description: Order status updated to Delivered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 orderId:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   example: Delivered
 *                 certificationOfDelivered:
 *                   type: string
 *                   description: URL of the uploaded certification image
 *                 order_delivery_at:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp when the order was marked as delivered
 *       400:
 *         description: Invalid input, missing image, or invalid status transition
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Certification image is required'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: integer
 *       403:
 *         description: Forbidden (user role not allowed or order not assigned to shipper)
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Unauthorized: Only Shipper can set orders to Delivered'
 *       404:
 *         description: Order not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Order not found'
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Failed to update order status'
 */
router.put("/:orderId/delivered", verifyToken, upload.single("file"), setOrderToDelivered);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Retrieve all orders (for authorized users)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   orderId:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   payment_time:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                   order_create_at:
 *                     type: string
 *                     format: date-time
 *                   order_address:
 *                     type: string
 *                   status:
 *                     type: string
 *                   fullName:
 *                     type: string
 *                   phone_number:
 *                     type: string
 *                     nullable: true
 *                   bankAccounts:
 *                     type: array
 *                     description: List of user's bank accounts
 *                     items:
 *                       type: object
 *                       properties:
 *                         bankName:
 *                           type: string
 *                         bankNumber:
 *                           type: string
 *                         isRefund:
 *                           type: boolean
 *                         reason:
 *                           type: string
 *                   orderItems:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         productId:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         quantity:
 *                           type: integer
 *                         price:
 *                           type: number
 *                         order_shipping_fee:
 *                           type: number
 *                         order_discount_value:
 *                           type: number
 *                         order_amount:
 *                           type: number
 *                         order_subtotal:
 *                           type: number
 *                         certificationOfDelivered:
 *                           type: string
 *                         invoiceUrl:
 *                           type: string
 *                           nullable: true
 *                         assignToShipperId:
 *                           type: integer
 *                         order_point_earn:
 *                           type: integer
 *                         note:
 *                           type: string
 *                           nullable: true
 *                         payment_method:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", verifyToken, getAllOrders);

/**
 * @swagger
 * /api/orders/paid:
 *   get:
 *     summary: Retrieve all orders with Paid status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of Paid orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   orderId:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   payment_time:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                   order_create_at:
 *                     type: string
 *                     format: date-time
 *                   order_address:
 *                     type: string
 *                   status:
 *                     type: string
 *                     description: Order status (Paid)
 *                   fullName:
 *                     type: string
 *                     description: User's full name
 *                   phone_number:
 *                     type: string
 *                     nullable: true
 *                   orderItems:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         productId:
 *                           type: integer
 *                         name:
 *                           type: string
 *                           description: Product name
 *                         quantity:
 *                           type: integer
 *                         price:
 *                           type: number
 *                   order_shipping_fee:
 *                     type: number
 *                   order_discount_value:
 *                     type: number
 *                   order_amount:
 *                     type: number
 *                   invoiceUrl:
 *                     type: string
 *                     nullable: true
 *                   order_point_earn:
 *                     type: integer
 *                   note:
 *                     type: string
 *                     nullable: true
 *                   payment_method:
 *                     type: string
 *                     description: Payment method name (e.g., Vnpay, PayOS)
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: integer
 *       403:
 *         description: Forbidden (user role not allowed)
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Unauthorized: Only Staff or Admin can view Paid orders'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get("/paid", verifyToken, getPaidOrders);

/**
 * @swagger
 * /api/orders/cancel/{orderId}:
 *   post:
 *     summary: Cancel an order by ID with a reason and optional bank details
 *     description: >
 *       Cancels an order if it was created within the last 5 minutes.
 *       If bank details (bankName, bankNumber) are provided, they will be saved for the user who placed the order.
 *       Upon successful cancellation, the materials used for the order will be restocked.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: The reason for canceling the order
 *                 example: Customer changed mind
 *               bankName:
 *                 type: string
 *                 description: Name of the bank for refund (optional)
 *                 example: VietinBank
 *                 nullable: true
 *               bankNumber:
 *                 type: string
 *                 description: Bank account number for refund (optional)
 *                 example: '1234567890'
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Order canceled successfully and materials have been restored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order canceled successfully.
 *       400:
 *         description: Bad request due to validation or order status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reason is required or Order not found / already canceled
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/cancel/:orderId", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, bankName, bankNumber } = req.body;
    // The userId from verifyToken is the staff/admin performing the action
    const result = await setOrderToCanceled(orderId, reason, req.userId, bankName, bankNumber);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to cancel order" });
  }
});

/**
 * @swagger
 * /api/orders/upload-refunded-certification/{orderId}:
 *   post:
 *     summary: Upload refund certification image for a canceled order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the canceled order
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Refund certification image (JPEG or PNG)
 *     responses:
 *       200:
 *         description: Refund certification uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 certificationRefund:
 *                   type: string
 *                   description: URL of the uploaded certification image
 *       400:
 *         description: Invalid file format, order not found, or order not canceled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post("/upload-refunded-certification/:orderId", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { orderId } = req.params;
    const file = req.file;
    const result = await uploadRefundCertification(orderId, req.userId, file);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to upload refund certification" });
  }
});

/**
 * @swagger
 * /api/orders/send-refunded-email/{orderId}:
 *   post:
 *     summary: Send refund email for a canceled order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the canceled order
 *     responses:
 *       200:
 *         description: Refund email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Order not found or not canceled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.post("/send-refunded-email/:orderId", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ where: { orderId } });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status_id !== 5) {
      return res.status(400).json({ message: "Order must be canceled to send refund email" });
    }
    const result = await sendRefundEmail(orderId, req.userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Failed to send refund email" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createOrder,
  handlePaymentSuccess,
  getUserOrders,
  setOrderToPreparing,
  setOrderToDelivering,
  setOrderToDelivered,
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
 *               order_shipping_fee:
 *                 type: number
 *                 description: Shipping fee for the order
 *               payment_method_id:
 *                 type: integer
 *                 description: "Payment method ID (1 for Vnpay, 2 for Momo, 3 for Zalopay, 4 for PayOS)"
 *               order_address:
 *                 type: string
 *                 description: Delivery address for the order
 *               note:
 *                 type: string
 *                 description: Optional note for the order (e.g., special delivery instructions)
 *                 nullable: true
 *                 example: "Please deliver after 5 PM"
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
 *                     description: Order status (e.g., Pending, Paid)
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
      order.status_id = 2;
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

    // Validate delivery address presence
    if (!deliver_address) {
      return res.status(400).json({
        status: 400,
        message: "Missing required field: deliver_address",
      });
    }

    // Validate address format: "street name, ward, district, city"
    const addressRegex = /^[^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+$/;
    if (!addressRegex.test(deliver_address)) {
      return res.status(400).json({
        status: 400,
        message: "Delivery address must be in the format: street name, ward, district, city",
      });
    }

    const defaultWeight = weight || 1000;

    // Hardcode pickup address
    const pickProvince = "TP. Hồ Chí Minh";
    const pickDistrict = "Quận 3";
    const pickWard = "Phường 1";
    const pickAddress = "643 Điện Biên Phủ";

    // Parse delivery address
    const addressParts = deliver_address.split(",").map((part) => part.trim());
    const [street, ward, district, province] = addressParts;

    const deliverAddress = street; // Only the street name
    let deliverWard = ward;
    let deliverDistrict = district;
    let deliverProvince = province;

    // Standardize province
    deliverProvince = standardizeProvince(deliverProvince);

    // Restrict delivery to HCMC
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
      deliver_option: "xteam", // Test with same-day delivery
      transport: "road", // Explicitly set transport mode
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
 * /api/orders/{orderId}/preparing:
 *   put:
 *     summary: Set order status to Preparing
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
 *         description: Order status updated to Preparing
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
 *                   example: Preparing
 *       400:
 *         description: Invalid input or invalid status transition
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Invalid status transition: Order is currently Pending. It must be Paid to transition to Preparing.'
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
 *               example: 'Unauthorized: Only Staff can set orders to Preparing'
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
router.put("/:orderId/preparing", verifyToken, setOrderToPreparing);

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
 *               example: 'Invalid status transition: Order is currently Paid. It must be Preparing to transition to Delivering.'
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
 *             required:
 *               - certificationOfDelivered
 *             properties:
 *               certificationOfDelivered:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG or PNG) proving delivery
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
 *         description: Invalid input or invalid status transition
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Invalid status transition: Order is currently Preparing. It must be Delivering to transition to Delivered.'
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
 *         description: Forbidden (user role not allowed or shipper not assigned)
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
router.put("/:orderId/delivered", verifyToken, upload.single("certificationOfDelivered"), setOrderToDelivered);

module.exports = router;

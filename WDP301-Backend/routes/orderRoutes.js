const express = require("express");
const router = express.Router();
const { createOrder, handlePaymentSuccess } = require("../services/orderService");
const verifyToken = require("../middlewares/verifyToken");
const Order = require("../models/order");
const Information = require("../models/information");
const axios = require("axios");
require("dotenv").config();

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

const standardizeProvince = (province) => {
  if (!province) return "TP. Hồ Chí Minh"; // Giá trị mặc định nếu không xác định được
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
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *               order_discount_value:
 *                 type: number
 *                 description: Discount value applied to the order
 *               order_shipping_fee:
 *                 type: number
 *                 description: Shipping fee for the order
 *               payment_method_id:
 *                 type: integer
 *                 description: "Payment method ID (1: Vnpay, 2: Momo, 3: Zalopay, 4: PayOS)"
 *               order_address:
 *                 type: string
 *                 description: Delivery address for the order
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, createOrder);

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
 *         required: true
 *         description: Payment status code from PayOS
 *     responses:
 *       200:
 *         description: Payment processed and invoice generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 invoiceUrl:
 *                   type: string
 *       400:
 *         description: Invalid input or payment failed
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
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
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: Payment status code from PayOS
 *     responses:
 *       200:
 *         description: Payment processed and invoice generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 invoiceUrl:
 *                   type: string
 *       400:
 *         description: Invalid input or payment failed
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
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
    // Có thể cập nhật trạng thái thành "Cancelled" nếu cần
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
  console.log("PayOS webhook received:", req.body);
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
      await order.save();
    }
    res.status(200).json({ message: "Webhook processed" });
  } catch (error) {
    console.log("Error in webhook:", error.message);
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
 *                 example: "643 Điện Biên Phủ, Phường 1, Quận 3, TPHCM"
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

    // Sử dụng giá trị mặc định cho weight nếu không được cung cấp
    const defaultWeight = weight || 1000;

    // Default pick address (sender address)
    const pickProvince = "TP. Hồ Chí Minh";
    const pickDistrict = "Quận 1";
    const pickWard = "Phường Bến Nghé";
    const pickAddress = "123 Đường Số 1";

    // Parse deliver address manually with improved logic
    const addressParts = deliver_address.split(",").map((part) => part.trim());
    let deliverWard = "Phường 1";
    let deliverDistrict = "Quận 3";
    let deliverProvince = "TPHCM";

    for (let part of addressParts) {
      part = part.toLowerCase();
      if (part.includes("phường") || part.includes("p.")) deliverWard = part;
      else if (part.includes("quận")) deliverDistrict = part;
      else if (part.includes("thành phố") || part.includes("tp")) deliverProvince = part;
    }
    deliverProvince = standardizeProvince(deliverProvince.replace(/tp/gi, "TP.").replace(/\s+/g, " ").trim());
    const deliverFullAddress = deliver_address;

    console.log("Parsed Address:", { deliverProvince, deliverDistrict, deliverWard, deliverFullAddress });

    // Call GHTK API to calculate shipping fee using GET method
    const ghtkApiUrl = process.env.GHTK_API_BASE_URL + "/services/shipment/fee";
    const queryParams = {
      pick_province: pickProvince,
      pick_district: pickDistrict,
      pick_ward: pickWard,
      pick_address: pickAddress,
      province: deliverProvince,
      district: deliverDistrict,
      ward: deliverWard,
      address: deliverFullAddress,
      weight: defaultWeight,
      value: 0,
      deliver_option: "none",
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

    // Lấy đúng giá trị fee từ response.data.fee.fee
    const shippingFee = response.data.fee && response.data.fee.fee ? response.data.fee.fee : 0;
    if (shippingFee === 0) {
      console.warn("Warning: GHTK returned zero shipping fee, possible invalid data.");
    }

    // Save address to Information table
    const newAddress = await Information.create({
      userId: req.userId,
      address: deliver_address,
    });

    // Chỉ trả về status, message, và fee
    res.status(200).json({
      status: 200,
      message: "Shipping fee calculated and address saved successfully",
      fee: shippingFee,
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

module.exports = router;

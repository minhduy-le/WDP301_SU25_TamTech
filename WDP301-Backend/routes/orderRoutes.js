const express = require("express");
const router = express.Router();
const orderService = require("../services/orderService");
const verifyToken = require("../middlewares/verifyToken");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");
const OrderStatus = require("../models/orderStatus");
const PaymentMethod = require("../models/paymentMethod");
const Information = require("../models/information");
const axios = require("axios");
require("dotenv").config();

const currentDateTime = new Date().toISOString();

// Mapping to standardize province names
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
 *     summary: Create a new order and get VNPay payment URL
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
 *               - storeId
 *               - payment_method_name
 *               - order_address
 *               - items
 *             properties:
 *               storeId:
 *                 type: integer
 *                 example: 1
 *               order_discount_value:
 *                 type: number
 *                 example: 10000
 *               order_shipping_fee:
 *                 type: number
 *                 example: 15000
 *               payment_method_name:
 *                 type: string
 *                 enum: ["Vnpay", "Momo", "Zalopay"]
 *                 example: "Vnpay"
 *               order_address:
 *                 type: string
 *                 example: "123 Main St, City"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Order created successfully with VNPay payment URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 order:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *                     order_discount_percent:
 *                       type: number
 *                 paymentUrl:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { storeId, order_discount_value, order_shipping_fee, payment_method_name, order_address, items } = req.body;

    console.log("Request Body:", req.body);

    if (!storeId || !payment_method_name || !order_address || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields or invalid items",
      });
    }

    const orderData = {
      storeId,
      order_discount_value,
      order_shipping_fee,
      payment_method_name,
      order_address,
    };

    const result = await orderService.createOrder(orderData, items, req.userId);

    res.status(200).json({
      status: 200,
      message: "Order created successfully",
      order: result.order,
      paymentUrl: result.paymentUrl,
    });
  } catch (error) {
    console.error("Error creating order:", error);
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
 *     summary: Get order details by orderId
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order to retrieve
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 order:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *                     order_amount:
 *                       type: number
 *                     order_discount_value:
 *                       type: number
 *                     order_discount_percent:
 *                       type: number
 *                     order_shipping_fee:
 *                       type: number
 *                     order_subtotal:
 *                       type: number
 *                     payment_method:
 *                       type: string
 *                     status:
 *                       type: string
 *                     order_create_at:
 *                       type: string
 *                     order_address:
 *                       type: string
 *                     invoiceUrl:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: integer
 *                           productName:
 *                             type: string
 *                           quantity:
 *                             type: integer
 *                           price:
 *                             type: number
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      where: { orderId },
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["name"],
            },
          ],
        },
        {
          model: OrderStatus,
          as: "OrderStatus",
          attributes: ["status"],
        },
        {
          model: PaymentMethod,
          as: "PaymentMethod",
          attributes: ["name"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: "Order not found",
      });
    }

    const orderDetails = {
      orderId: order.orderId,
      order_amount: order.order_amount,
      order_discount_value: order.order_discount_value,
      order_discount_percent: order.order_discount_percent,
      order_shipping_fee: order.order_shipping_fee,
      order_subtotal: order.order_subtotal,
      payment_method: order.PaymentMethod?.name || "Unknown",
      status: order.OrderStatus?.status || "Unknown",
      order_create_at: order.order_create_at.toISOString(),
      order_address: order.order_address,
      invoiceUrl: order.invoiceUrl,
      items: order.OrderItems.map((item) => ({
        productId: item.productId,
        productName: item.Product?.name || "Unknown Product",
        quantity: item.quantity,
        price: item.price,
      })),
    };

    res.status(200).json({
      status: 200,
      message: "Order details retrieved successfully",
      order: orderDetails,
    });
  } catch (error) {
    console.error("Error retrieving order:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/orders/payment-callback:
 *   get:
 *     summary: Handle VNPay payment callback
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         description: VNPay response code
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Payment callback processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 orderId:
 *                   type: integer
 *       400:
 *         description: Invalid payment signature
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get("/payment-callback", async (req, res) => {
  try {
    const result = await orderService.handlePaymentCallback(req.query);

    res.status(200).json({
      status: 200,
      message: result.success ? "Payment successful" : "Payment failed",
      success: result.success,
      orderId: result.orderId,
    });
  } catch (error) {
    console.error("Error handling payment callback:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
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

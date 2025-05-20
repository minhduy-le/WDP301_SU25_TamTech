const express = require("express");
const router = express.Router();
const orderService = require("../services/orderService");
const verifyToken = require("../middlewares/verifyToken");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");
const OrderStatus = require("../models/orderStatus");
const PaymentMethod = require("../models/paymentMethod");

const currentDateTime = new Date().toISOString();

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

    console.log("Request Body:", req.body); // Log req.body to debug items

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

    // Find the order by orderId with correct alias "OrderItems"
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

    // Format the response
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

module.exports = router;

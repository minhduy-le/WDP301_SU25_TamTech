const express = require("express");
const router = express.Router();
const {
  createOrder,
  handlePaymentSuccess,
  setOrderToApproved,
  setOrderToPreparing,
  setOrderToCooked,
  cancelOrderForPos,
} = require("../services/orderServicePosApp");
const verifyToken = require("../middlewares/verifyToken");
require("dotenv").config();

/**
 * @swagger
 * /api/pos-orders:
 *   post:
 *     summary: Create a new order for POS app
 *     tags: [POS Orders]
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
 * /api/pos-orders/success:
 *   get:
 *     summary: Handle successful payment callback for POS app (GET)
 *     tags: [POS Orders]
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
 *         description: Redirects to POS app payment success page
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 *   post:
 *     summary: Handle successful payment callback for POS app (POST)
 *     tags: [POS Orders]
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
 *         description: Redirects to POS app payment success page
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get("/success", handlePaymentSuccess);
router.post("/success", handlePaymentSuccess);

/**
 * @swagger
 * /api/pos-orders/cancel:
 *   get:
 *     summary: Handle payment cancellation callback for POS app
 *     tags: [POS Orders]
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
 * /api/pos-orders/{orderId}/cancel:
 *   put:
 *     summary: Cancel an order from the POS app (any status)
 *     tags:
 *       - POS Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order to cancel
 *     responses:
 *       '200':
 *         description: Order canceled successfully
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
 *                   example: Order canceled successfully and materials have been restored.
 *       '400':
 *         description: Bad Request (e.g., order already canceled)
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: This order has already been canceled.
 *       '403':
 *         description: Forbidden
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: You are not authorized to cancel this order.
 *       '404':
 *         description: Order not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Order not found.
 *       '500':
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Failed to cancel order due to a server error.
 */
router.put("/:orderId/cancel", verifyToken, cancelOrderForPos);

/**
 * @swagger
 * /api/pos-orders/{orderId}/approved:
 *   put:
 *     summary: Set order status to Approved for POS app
 *     tags: [POS Orders]
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
 * /api/pos-orders/{orderId}/preparing:
 *   put:
 *     summary: Set order status to Preparing for POS app
 *     tags: [POS Orders]
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
 *               example: 'Invalid status transition: Order is currently Paid. It must be Approved to transition to Preparing.'
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
 * /api/pos-orders/{orderId}/cooked:
 *   put:
 *     summary: Set order status to Cooked for POS app
 *     tags: [POS Orders]
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
 *         description: Order status updated to Cooked
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
 *                   example: Cooked
 *                 cookedBy:
 *                   type: integer
 *                   description: ID of the staff who marked the order as cooked
 *                 cookedTime:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp when the order was marked as cooked
 *       400:
 *         description: Invalid input or invalid status transition
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Invalid status transition: Order is currently Approved. It must be Preparing to transition to Cooked.'
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
 *               example: 'Unauthorized: Only Staff can set orders to Cooked'
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
router.put("/:orderId/cooked", verifyToken, setOrderToCooked);

module.exports = router;

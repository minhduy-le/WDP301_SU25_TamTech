const express = require("express");
const router = express.Router();
const { createOrderPosApp, setOrderToPaidPosApp } = require("../services/orderServicePosApp");
const verifyToken = require("../middlewares/verifyToken");

// Debug: Kiểm tra import
console.log("orderRoutesPosApp.js: Imported createOrderPosApp:", typeof createOrderPosApp);
console.log("orderRoutesPosApp.js: Imported setOrderToPaidPosApp:", typeof setOrderToPaidPosApp);
console.log("orderRoutesPosApp.js: Imported verifyToken:", typeof verifyToken);

/**
 * @swagger
 * /api/pos/orders:
 *   post:
 *     summary: Create a new POS order
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
 *               - phone_number
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
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     price:
 *                       type: number
 *                       example: 10000
 *               order_discount_value:
 *                 type: number
 *                 example: 5000
 *               promotion_code:
 *                 type: string
 *                 example: SUMMER2025
 *               note:
 *                 type: string
 *                 example: Customer prefers quick service
 *               phone_number:
 *                 type: string
 *                 example: 0123456789
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
 *                   example: Order created successfully
 *                 orderId:
 *                   type: integer
 *                   example: 123
 *                 checkoutUrl:
 *                   type: string
 *                   example: https://payos.vn/checkout/abc123
 *       400:
 *         description: Bad request
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Invalid phone number (10-12 digits) is required"
 *       403:
 *         description: Unauthorized
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Unauthorized: Only Staff or Admin can create POS orders"
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to create order"
 */
router.post("/", verifyToken, async (req, res, next) => {
  try {
    if (typeof createOrderPosApp !== "function") {
      throw new Error("createOrderPosApp is not a function");
    }
    await createOrderPosApp(req, res);
  } catch (error) {
    console.error("Error in POST /pos/orders:", error.message, error.stack);
    res.status(error.status || 500).send(error.message);
  }
});

/**
 * @swagger
 * /api/pos/orders/{orderId}/paid:
 *   put:
 *     summary: Set POS order to Paid
 *     tags: [POS Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The order ID
 *     responses:
 *       200:
 *         description: Order status updated to Paid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order status updated to Paid
 *                 orderId:
 *                   type: integer
 *                   example: 123
 *                 status:
 *                   type: string
 *                   example: Paid
 *                 invoiceUrl:
 *                   type: string
 *                   example: https://firebase.storage/receipt_123.pdf
 *       400:
 *         description: Bad request
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Invalid order ID"
 *       403:
 *         description: Unauthorized
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Unauthorized: Only Staff or Admin can set orders to Paid"
 *       404:
 *         description: Order not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Order not found"
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to update order status"
 */
router.put("/:orderId/paid", verifyToken, async (req, res, next) => {
  try {
    if (typeof setOrderToPaidPosApp !== "function") {
      throw new Error("setOrderToPaidPosApp is not a function");
    }
    await setOrderToPaidPosApp(req, res);
  } catch (error) {
    console.error("Error in PUT /pos/orders/:orderId/paid:", error.message, error.stack);
    res.status(error.status || 500).send(error.message);
  }
});

module.exports = router;

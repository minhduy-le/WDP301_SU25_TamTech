const express = require("express");
const router = express.Router();
const { getAllTransactions, setTransactionToPaid } = require("../services/transactionService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * tags:
 *   - name: Transactions
 *     description: API để quản lý các giao dịch
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Lấy danh sách tất cả các giao dịch
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Một danh sách các giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   transactionId:
 *                     type: integer
 *                     description: ID của giao dịch.
 *                   orderId:
 *                     type: integer
 *                     description: ID của đơn hàng liên quan.
 *                   payment_method:
 *                     type: string
 *                     description: Tên phương thức thanh toán (Vnpay, Momo, Zalopay, PayOS).
 *                     example: "PayOS"
 *                   amount:
 *                     type: number
 *                     description: Số tiền giao dịch.
 *                   status:
 *                     type: string
 *                     description: Trạng thái giao dịch (PENDING, PAID, FAILED).
 *                     example: "PAID"
 *                   transaction_time:
 *                     type: string
 *                     format: date-time
 *                     description: Thời gian giao dịch được thực hiện.
 *                   type:
 *                     type: string
 *                     description: Loại giao dịch (IN, OUT).
 *                     example: "IN"
 *       401:
 *         description: Unauthorized - Không có quyền truy cập.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.get("/", verifyToken, getAllTransactions);

/**
 * @swagger
 * /api/transactions/{orderId}/set-paid:
 *   put:
 *     summary: Cập nhật trạng thái giao dịch thành PAID bằng Order ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của đơn hàng có giao dịch cần cập nhật.
 *     responses:
 *       200:
 *         description: Cập nhật thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật trạng thái giao dịch thành PAID thành công."
 *                 transaction:
 *                   $ref: '#/components/schemas/TransactionObject'
 *       400:
 *         description: Order ID không hợp lệ.
 *       404:
 *         description: Không tìm thấy giao dịch.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.put("/:orderId/set-paid", verifyToken, setTransactionToPaid);

module.exports = router;

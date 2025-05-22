const express = require("express");
const router = express.Router();
const shipperService = require("../services/shipperService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/shippers:
 *   get:
 *     summary: Get list of shippers
 *     description: Retrieve all users with role 'Shipper'
 *     tags: [Shippers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shippers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   fullName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone_number:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const shippers = await shipperService.getShippers();
    res.status(200).json(shippers);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/shippers/assign/{orderId}:
 *   post:
 *     summary: Assign a shipper to an order
 *     description: Update the assignToShipperId field of an order with the specified shipper ID
 *     tags: [Shippers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order to assign a shipper to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipperId
 *             properties:
 *               shipperId:
 *                 type: integer
 *                 description: The ID of the shipper to assign
 *     responses:
 *       200:
 *         description: Shipper assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 orderId:
 *                   type: integer
 *                 shipperId:
 *                   type: integer
 *       400:
 *         description: Invalid input or shipper not found
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/assign/:orderId", verifyToken, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { shipperId } = req.body;
    const result = await shipperService.assignShipperToOrder(orderId, shipperId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

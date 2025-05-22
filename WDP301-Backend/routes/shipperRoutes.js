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

module.exports = router;

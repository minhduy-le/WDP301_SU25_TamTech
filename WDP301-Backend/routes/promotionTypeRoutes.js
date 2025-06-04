const express = require("express");
const router = express.Router();
const { getPromotionTypes } = require("../services/promotionTypeService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/promotion-types:
 *   get:
 *     summary: Retrieve all promotion types
 *     tags: [PromotionTypes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of promotion types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   promotionTypeId:
 *                     type: integer
 *                   name:
 *                     type: string
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
 *               example: "Failed to retrieve promotion types"
 */
router.get("/", verifyToken, getPromotionTypes);

module.exports = router;

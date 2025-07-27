const express = require("express");
const router = express.Router();
const {
  createPromotionType,
  updatePromotionType,
  getPromotionTypes,
  deletePromotionType,
} = require("../services/promotionTypeService");
const verifyToken = require("../middlewares/verifyToken");
const restrictToRoles = require("../middlewares/restrictToRoles");

/**
 * @swagger
 * /api/promotion-types:
 *   post:
 *     summary: Create a new promotion type
 *     tags: [PromotionTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the promotion type
 *                 example: "Discount"
 *     responses:
 *       201:
 *         description: Promotion type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 promotionTypeId:
 *                   type: integer
 *                 name:
 *                   type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Name is required and must be a non-empty string"
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
 *               example: "Failed to create promotion type"
 */
router.post("/", verifyToken, restrictToRoles("Manager"), createPromotionType);

/**
 * @swagger
 * /api/promotion-types/{promotionTypeId}:
 *   put:
 *     summary: Update a promotion type
 *     tags: [PromotionTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promotionTypeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the promotion type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the promotion type
 *                 example: "Special Offer"
 *     responses:
 *       200:
 *         description: Promotion type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 promotionTypeId:
 *                   type: integer
 *                 name:
 *                   type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Name is required and must be a non-empty string"
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
 *       404:
 *         description: Promotion type not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Promotion type not found"
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to update promotion type"
 */
router.put("/:promotionTypeId", verifyToken, restrictToRoles("Manager"), updatePromotionType);

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

/**
 * @swagger
 * /api/promotion-types/{promotionTypeId}:
 *   delete:
 *     summary: Deactivate a promotion type
 *     tags: [PromotionTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promotionTypeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the promotion type to deactivate
 *     responses:
 *       200:
 *         description: Promotion type deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 promotionTypeId:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Invalid promotion type ID"
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
 *       404:
 *         description: Promotion type not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Promotion type not found"
 *       409:
 *         description: Promotion type is in use
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Cannot deactivate promotion type because it is used in existing promotions"
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Failed to deactivate promotion type"
 */
router.delete("/:promotionTypeId", verifyToken, restrictToRoles("Manager"), deletePromotionType);

module.exports = router;

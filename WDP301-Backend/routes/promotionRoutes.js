const express = require("express");
const router = express.Router();
const promotionService = require("../services/promotionService");
const { body, param, validationResult } = require("express-validator");
const verifyToken = require("../middlewares/verifyToken");

const promotionValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Promotion name is required")
    .isLength({ max: 100 })
    .withMessage("Promotion name must not exceed 100 characters")
    .custom(async (value, { req }) => {
      const existing = await promotionService.checkNameExists(value, req.params.id);
      if (existing) {
        throw new Error("Promotion name already exists");
      }
      return true;
    }),
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Promotion code is required")
    .isLength({ max: 50 })
    .withMessage("Promotion code must not exceed 50 characters")
    .custom(async (value, { req }) => {
      const existing = await promotionService.checkCodeExists(value, req.params.id);
      if (existing) {
        throw new Error("Promotion code already exists");
      }
      return true;
    }),
  body("promotionTypeId")
    .notEmpty()
    .withMessage("Promotion type ID is required")
    .isInt({ min: 1 })
    .withMessage("Promotion type ID must be a positive integer"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must not exceed 255 characters"),
  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Invalid start date format")
    .custom((value) => {
      const startDate = new Date(value);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      if (startDate <= currentDate) {
        throw new Error("Start date must be after current date");
      }
      return true;
    }),
  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("Invalid end date format")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  body("minOrderAmount")
    .notEmpty()
    .withMessage("Minimum order amount is required")
    .isFloat({ min: 0 })
    .withMessage("Minimum order amount must be a positive number"),
  body("discountAmount")
    .notEmpty()
    .withMessage("Discount amount is required")
    .isFloat({ min: 1000 })
    .withMessage("Discount amount must be at least 1000"),
  body("maxNumberOfUses")
    .notEmpty()
    .withMessage("Maximum number of uses is required")
    .isInt({ min: 1 })
    .withMessage("Maximum number of uses must be a positive integer"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send(errors.array()[0].msg);
  }
  next();
};

const handleError = (error, res) => {
  console.error("Error:", error);

  if (
    error.message.includes("Promotion name is required") ||
    error.message.includes("Promotion code is required") ||
    error.message.includes("Promotion type ID is required") ||
    error.message.includes("Invalid start date format") ||
    error.message.includes("Invalid end date format") ||
    error.message.includes("Start date must be after current date") ||
    error.message.includes("End date must be after start date") ||
    error.message.includes("Promotion name must not exceed 100 characters") ||
    error.message.includes("Promotion code must not exceed 50 characters") ||
    error.message.includes("Description must not exceed 255 characters") ||
    error.message.includes("Minimum order amount must be a positive number") ||
    error.message.includes("Discount amount must be a positive number") ||
    error.message.includes("Maximum number of uses must be a positive integer") ||
    error.message.includes("Promotion name already exists") ||
    error.message.includes("Promotion code already exists") ||
    error.message.includes("Promotion type ID must be a positive integer") ||
    error.message.includes("Invalid promotion ID") ||
    error.message.includes("Invalid user ID")
  ) {
    return res.status(400).send(error.message);
  }

  if (error.message.includes("not found")) {
    return res.status(404).send(error.message);
  }

  return res.status(500).send(error.message);
};

/**
 * @swagger
 * /api/promotions:
 *   post:
 *     summary: Create a new promotion
 *     tags: [Promotions]
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
 *               - code
 *               - promotionTypeId
 *               - startDate
 *               - endDate
 *               - minOrderAmount
 *               - discountAmount
 *               - maxNumberOfUses
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               code:
 *                 type: string
 *                 maxLength: 50
 *               promotionTypeId:
 *                 type: integer
 *                 minimum: 1
 *               description:
 *                 type: string
 *                 maxLength: 255
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               minOrderAmount:
 *                 type: number
 *                 minimum: 0
 *               discountAmount:
 *                 type: number
 *                 minimum: 0
 *               maxNumberOfUses:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Promotion created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, promotionValidation, validate, async (req, res) => {
  try {
    const promotion = await promotionService.createPromotion({
      ...req.body,
      createBy: req.userId,
    });
    res.status(201).json(promotion);
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: Get all promotions
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all promotions
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const promotions = await promotionService.getAllPromotions();
    418;
    res.status(200).json(promotions);
  } catch (error) {
    handleError(error, res);
  }
});

/**
 * @swagger
 * /api/promotions/code/{code}:
 *   get:
 *     summary: Get a promotion by code
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Promotion details
 *       400:
 *         description: Invalid promotion code
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Server error
 */
router.get(
  "/code/:code",
  verifyToken,
  [
    param("code")
      .trim()
      .notEmpty()
      .withMessage("Promotion code is required")
      .isLength({ max: 50 })
      .withMessage("Invalid promotion code"),
  ],
  validate,
  async (req, res) => {
    try {
      const promotion = await promotionService.getPromotionByCode(req.params.code);
      res.status(200).json(promotion);
    } catch (error) {
      handleError(error, res);
    }
  }
);

/**
 * @swagger
 * /api/promotions/{id}:
 *   get:
 *     summary: Get a promotion by ID
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promotion details
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  verifyToken,
  [param("id").isInt().withMessage("Invalid promotion ID")],
  validate,
  async (req, res) => {
    try {
      const promotion = await promotionService.getPromotionById(req.params.id);
      res.status(200).json(promotion);
    } catch (error) {
      handleError(error, res);
    }
  }
);

/**
 * @swagger
 * /api/promotions/{id}:
 *   put:
 *     summary: Update a promotion
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - promotionTypeId
 *               - startDate
 *               - endDate
 *               - minOrderAmount
 *               - discountAmount
 *               - maxNumberOfUses
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               code:
 *                 type: string
 *                 maxLength: 50
 *               promotionTypeId:
 *                 type: integer
 *                 minimum: 1
 *               description:
 *                 type: string
 *                 maxLength: 255
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               minOrderAmount:
 *                 type: number
 *                 minimum: 0
 *               discountAmount:
 *                 type: number
 *                 minimum: 0
 *               maxNumberOfUses:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Promotion updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id",
  verifyToken,
  [param("id").isInt().withMessage("Invalid promotion ID"), ...promotionValidation],
  validate,
  async (req, res) => {
    try {
      const promotion = await promotionService.updatePromotion(req.params.id, req.body);
      res.status(200).json(promotion);
    } catch (error) {
      handleError(error, res);
    }
  }
);

/**
 * @swagger
 * /api/promotions/{id}/activate:
 *   put:
 *     summary: Reactivate a promotion
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the promotion to reactivate
 *     responses:
 *       200:
 *         description: Promotion reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Invalid ID or validation error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Invalid promotion ID
 *       401:
 *         description: Unauthorized
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       404:
 *         description: Promotion not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Promotion not found
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Server error
 */
router.put(
  "/:id/activate",
  verifyToken,
  [param("id").isInt().withMessage("Invalid promotion ID")],
  validate,
  async (req, res) => {
    try {
      const promotion = await promotionService.reactivatePromotion(req.params.id);
      res.status(200).json(promotion);
    } catch (error) {
      handleError(error, res);
    }
  }
);

/**
 * @swagger
 * /api/promotions/{id}:
 *   delete:
 *     summary: Soft delete a promotion
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Promotion deactivated successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  verifyToken,
  [param("id").isInt().withMessage("Invalid promotion ID")],
  validate,
  async (req, res) => {
    try {
      await promotionService.deactivatePromotion(req.params.id);
      res.status(200).json({ message: "Promotion deactivated successfully" });
    } catch (error) {
      handleError(error, res);
    }
  }
);

/**
 * @swagger
 * /api/promotions/user/{userId}:
 *   get:
 *     summary: Get active promotions for a specific user
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to retrieve promotions for
 *     responses:
 *       200:
 *         description: List of active promotions for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Invalid user ID
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Invalid user ID
 *       401:
 *         description: Unauthorized
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       404:
 *         description: No promotions found for this user
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: No promotions found for this user
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Server error
 */
router.get(
  "/user/:userId",
  verifyToken,
  [param("userId").isInt({ min: 1 }).withMessage("Invalid user ID")],
  validate,
  async (req, res) => {
    try {
      const promotions = await promotionService.getPromotionsByUserId(req.params.userId);
      res.status(200).json(promotions);
    } catch (error) {
      handleError(error, res);
    }
  }
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Promotion:
 *       type: object
 *       required:
 *         - promotionId
 *         - name
 *         - code
 *         - promotionTypeId
 *         - startDate
 *         - endDate
 *         - minOrderAmount
 *         - discountAmount
 *         - maxNumberOfUses
 *         - isActive
 *         - createBy
 *       properties:
 *         promotionId:
 *           type: integer
 *         name:
 *           type: string
 *           maxLength: 100
 *         code:
 *           type: string
 *           maxLength: 50
 *         barcode:
 *           type: string
 *           maxLength: 100
 *           description: URL to the barcode SVG stored in Firebase
 *           example: https://storage.googleapis.com/course-ac11b.appspot.com/barcodes/WELCOME_16_1697051234567.svg
 *         promotionTypeId:
 *           type: integer
 *           minimum: 1
 *         description:
 *           type: string
 *           maxLength: 255
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         minOrderAmount:
 *           type: number
 *         discountAmount:
 *           type: number
 *         NumberCurrentUses:
 *           type: integer
 *         maxNumberOfUses:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         createBy:
 *           type: integer
 *         forUser:
 *           type: integer
 *         isUsedBySpecificUser:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
module.exports = router;

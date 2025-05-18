const express = require("express");
const router = express.Router();
const { productTypeService } = require("../services/productTypeService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/product-types:
 *   post:
 *     summary: Create a new product type
 *     tags: [ProductTypes]
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
 *                 maxLength: 100
 *                 description: The name of the product type
 *     responses:
 *       201:
 *         description: Product type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productTypeId:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 createdBy:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    const productType = await productTypeService.createProductType(name);
    res.status(201).json(productType);
  } catch (error) {
    console.error("Error in POST /api/product-types:", error.message);
    if (
      error.message === "Name is required, must be a non-empty string, and max length is 100" ||
      error.message === "Failed to create product type"
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/product-types:
 *   get:
 *     summary: Retrieve all product types
 *     tags: [ProductTypes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of product types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productTypeId:
 *                     type: integer
 *                   name:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const productTypes = await productTypeService.getProductTypes();
    res.status(200).json(productTypes);
  } catch (error) {
    console.error("Error in GET /api/product-types:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { productTypeService } = require("../services/productTypeService");
const verifyToken = require("../middlewares/verifyToken");
const restrictToRoles = require("../middlewares/restrictToRoles");

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
router.post("/", verifyToken, restrictToRoles("Manager"), async (req, res) => {
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
 *                   isActive:
 *                     type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const productTypes = await productTypeService.getProductTypes();
    res.status(200).json(productTypes);
  } catch (error) {
    console.error("Error in GET /api/product-types:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/product-types/{productTypeId}:
 *   put:
 *     summary: Update a product type's name
 *     tags: [ProductTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productTypeId
 *         in: path
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
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: The new name of the product type
 *     responses:
 *       200:
 *         description: Product type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productTypeId:
 *                   type: integer
 *                 name:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product type not found
 *       500:
 *         description: Server error
 */
router.put("/:productTypeId", verifyToken, restrictToRoles("Manager"), async (req, res) => {
  try {
    const productTypeId = parseInt(req.params.productTypeId);
    const { name } = req.body;
    const updatedProductType = await productTypeService.updateProductType(productTypeId, name);
    res.status(200).json(updatedProductType);
  } catch (error) {
    console.error("Error in PUT /api/product-types/:productTypeId:", error.message);
    if (
      error.message === "Name is required, must be a non-empty string, and max length is 100" ||
      error.message === "Product type not found" ||
      error.message === "Failed to update product type"
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /api/product-types/{productTypeId}/activate:
 *   put:
 *     summary: Reactivate a product type
 *     tags: [ProductTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productTypeId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product type to reactivate
 *     responses:
 *       200:
 *         description: Product type reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productTypeId:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *       400:
 *         description: Invalid input or product type already active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product type is already active
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forbidden
 *       404:
 *         description: Product type not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product type not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
router.put("/:productTypeId/activate", verifyToken, restrictToRoles("Manager"), async (req, res) => {
  try {
    const productTypeId = parseInt(req.params.productTypeId);
    if (isNaN(productTypeId) || productTypeId < 1) {
      return res.status(400).json({ message: "Invalid product type ID" });
    }
    const productType = await productTypeService.reactivateProductType(productTypeId);
    res.status(200).json(productType);
  } catch (error) {
    console.error("Error in PUT /api/product-types/:productTypeId/activate:", error);
    if (
      error.message === "Product type not found" ||
      error.message === "Product type is already active" ||
      error.message === "Failed to reactivate product type"
    ) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Unauthorized") {
      return res.status(401).json({ message: error.message });
    }
    if (error.message === "Forbidden") {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || "Server error" });
  }
});

/**
 * @swagger
 * /api/product-types/{productTypeId}:
 *   delete:
 *     summary: Deactivate a product type (set isActive to false)
 *     tags: [ProductTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: productTypeId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product type deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productTypeId:
 *                   type: integer
 *                 isActive:
 *                   type: boolean
 *       400:
 *         description: Invalid input or product type referenced by active products
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product type not found
 *       500:
 *         description: Server error
 */
router.delete("/:productTypeId", verifyToken, restrictToRoles("Manager"), async (req, res) => {
  try {
    const productTypeId = parseInt(req.params.productTypeId);
    const deletedProductType = await productTypeService.deleteProductType(productTypeId);
    res.status(200).json(deletedProductType);
  } catch (error) {
    console.error("Error in DELETE /api/product-types/:productTypeId:", error.message || error);
    if (typeof error === "string") {
      return res.status(400).json({ message: error });
    } else if (error.message) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

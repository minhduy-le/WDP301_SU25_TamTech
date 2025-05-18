/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const productService = require("../services/productService");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - productTypeId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image file
 *               productTypeId:
 *                 type: integer
 *                 description: Product type ID
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     image:
 *                       type: string
 *                     productTypeId:
 *                       type: integer
 *                     createBy:
 *                       type: string
 *                     createAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, upload.single("image"), async (req, res, next) => {
  try {
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      productTypeId: req.body.productTypeId,
      createBy: req.userId, // Use userId from token
    };

    const imageFile = req.file;
    const newProduct = await productService.createProduct(productData, imageFile);
    res.status(201).json({
      status: 201,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with their product types
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products with product types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       image:
 *                         type: string
 *                       productTypeId:
 *                         type: integer
 *                       createBy:
 *                         type: string
 *                       createAt:
 *                         type: string
 *                         format: date-time
 *                       productType:
 *                         type: object
 *                         properties:
 *                           productTypeId:
 *                             type: integer
 *                           name:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({
      status: 200,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});

module.exports = router;

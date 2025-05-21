const express = require("express");
const router = express.Router();
const productService = require("../services/productService");
const verifyToken = require("../middlewares/verifyToken");
const { uploadImageToFirebase } = require("../config/firebase");
const axios = require("axios");

/**
 * @swagger
 * /api/products/best-seller:
 *   get:
 *     summary: Get best seller products based on order items
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of best seller products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 products:
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
 *                       ProductType:
 *                         type: object
 *                         properties:
 *                           productTypeId:
 *                             type: integer
 *                           name:
 *                             type: string
 *       500:
 *         description: Server error
 */
router.get("/best-seller", async (req, res, next) => {
  try {
    const products = await productService.getBestSellerProducts();

    res.status(200).json({
      status: 200,
      message: "Best seller products retrieved successfully",
      products,
    });
  } catch (error) {
    console.error("Error retrieving best seller products:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product with recipes
 *     tags: [Products]
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
 *               - price
 *               - productTypeId
 *               - recipes
 *             properties:
 *               name:
 *                 type: string
 *                 example: Chocolate Cake
 *               description:
 *                 type: string
 *                 example: Delicious chocolate cake
 *               price:
 *                 type: number
 *                 example: 29.99
 *               image:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               productTypeId:
 *                 type: integer
 *                 example: 1
 *               recipes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - materialId
 *                     - quantity
 *                   properties:
 *                     materialId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 100
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
 *                 product:
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
 *                     createAt:
 *                       type: string
 *                       format: date-time
 *                     productTypeId:
 *                       type: integer
 *                     createBy:
 *                       type: string
 *                     storeId:
 *                       type: integer
 *                     isActive:
 *                       type: boolean
 *                     ProductType:
 *                       type: object
 *                       properties:
 *                         productTypeId:
 *                           type: integer
 *                         name:
 *                           type: string
 *                     ProductRecipes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productRecipeId:
 *                             type: integer
 *                           productId:
 *                             type: integer
 *                           materialId:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           Material:
 *                             type: object
 *                             properties:
 *                               materialId:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               quantity:
 *                                 type: integer
 *                               storeId:
 *                                 type: integer
 *       400:
 *         description: Bad request or insufficient material quantity
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { name, description, price, image, productTypeId, recipes } = req.body;

    if (!name || !price || !productTypeId || !recipes || !Array.isArray(recipes)) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields or invalid recipes format",
      });
    }

    let imageUrl = null;
    if (image) {
      let imageBuffer;
      const fileName = `product_${Date.now()}.jpg`;

      if (image.startsWith("http")) {
        const response = await axios.get(image, { responseType: "arraybuffer" });
        imageBuffer = Buffer.from(response.data, "binary");
      } else {
        imageBuffer = Buffer.from(image, "base64");
      }

      imageUrl = await uploadImageToFirebase(imageBuffer, fileName);
    }

    const productData = {
      name,
      description,
      price,
      image: imageUrl,
      productTypeId,
      createBy: req.userId,
      storeId: 1,
      recipes,
    };

    const result = await productService.createProduct(productData);

    res.status(201).json({
      status: 201,
      message: "Product created successfully",
      product: result,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get products with pagination and sort by price descending
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 products:
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
 *                       createAt:
 *                         type: string
 *                         format: date-time
 *                       productTypeId:
 *                         type: integer
 *                       createBy:
 *                         type: string
 *                       storeId:
 *                         type: integer
 *                       isActive:
 *                         type: boolean
 *                       ProductType:
 *                         type: object
 *                         properties:
 *                           productTypeId:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       ProductRecipes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productRecipeId:
 *                               type: integer
 *                             productId:
 *                               type: integer
 *                             materialId:
 *                               type: integer
 *                             quantity:
 *                               type: integer
 *                             Material:
 *                               type: object
 *                               properties:
 *                                 materialId:
 *                                   type: integer
 *                                 name:
 *                                   type: string
 *                                 quantity:
 *                                   type: integer
 *                                 storeId:
 *                                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       400:
 *         description: Invalid page number
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    if (page < 1) {
      return res.status(400).json({
        status: 400,
        message: "Page number must be greater than 0",
      });
    }

    const limit = 5;
    const offset = (page - 1) * limit;

    const result = await productService.getProducts({ page, limit, offset });

    res.status(200).json({
      status: 200,
      message: "Products retrieved successfully",
      products: result.products,
      totalPages: result.totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/products/type/{productTypeId}:
 *   get:
 *     summary: Get products by product type ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productTypeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product type ID
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 products:
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
 *                       createAt:
 *                         type: string
 *                         format: date-time
 *                       productTypeId:
 *                         type: integer
 *                       createBy:
 *                         type: string
 *                       storeId:
 *                         type: integer
 *                       isActive:
 *                         type: boolean
 *                       ProductType:
 *                         type: object
 *                         properties:
 *                           productTypeId:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       ProductRecipes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productRecipeId:
 *                               type: integer
 *                             productId:
 *                               type: integer
 *                             materialId:
 *                               type: integer
 *                             quantity:
 *                               type: integer
 *                             Material:
 *                               type: object
 *                               properties:
 *                                 materialId:
 *                                   type: integer
 *                                 name:
 *                                   type: string
 *                                 quantity:
 *                                   type: integer
 *                                 storeId:
 *                                   type: integer
 *       400:
 *         description: Invalid product type ID
 *       500:
 *         description: Server error
 */
router.get("/type/:productTypeId", async (req, res, next) => {
  try {
    const productTypeId = parseInt(req.params.productTypeId);
    if (isNaN(productTypeId) || productTypeId < 1) {
      return res.status(400).json({
        status: 400,
        message: "Invalid product type ID",
      });
    }

    const products = await productService.getProductsByType(productTypeId);

    res.status(200).json({
      status: 200,
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    console.error("Error retrieving products by type:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     summary: Get a product by product ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 product:
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
 *                     createAt:
 *                       type: string
 *                       format: date-time
 *                     productTypeId:
 *                       type: integer
 *                     createBy:
 *                       type: string
 *                     storeId:
 *                       type: integer
 *                     isActive:
 *                       type: boolean
 *                     ProductType:
 *                       type: object
 *                       properties:
 *                         productTypeId:
 *                           type: integer
 *                         name:
 *                           type: string
 *                     ProductRecipes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productRecipeId:
 *                             type: integer
 *                           productId:
 *                             type: integer
 *                           materialId:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           Material:
 *                             type: object
 *                             properties:
 *                               materialId:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               quantity:
 *                                 type: integer
 *                               storeId:
 *                                 type: integer
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found or inactive
 *       500:
 *         description: Server error
 */
router.get("/:productId", async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId) || productId < 1) {
      return res.status(400).json({
        status: 400,
        message: "Invalid product ID",
      });
    }

    const product = await productService.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found or inactive",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    console.error("Error retrieving product:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Chocolate Cake
 *               description:
 *                 type: string
 *                 example: Updated description
 *               price:
 *                 type: number
 *                 example: 39.99
 *               image:
 *                 type: string
 *                 example: https://example.com/updated-image.jpg
 *               productTypeId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 product:
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
 *                     createAt:
 *                       type: string
 *                       format: date-time
 *                     productTypeId:
 *                       type: integer
 *                     createBy:
 *                       type: string
 *                     storeId:
 *                       type: integer
 *                     isActive:
 *                       type: boolean
 *                     ProductType:
 *                       type: object
 *                       properties:
 *                         productTypeId:
 *                           type: integer
 *                         name:
 *                           type: string
 *                     ProductRecipes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productRecipeId:
 *                             type: integer
 *                           productId:
 *                             type: integer
 *                           materialId:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           Material:
 *                             type: object
 *                             properties:
 *                               materialId:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               quantity:
 *                                 type: integer
 *                               storeId:
 *                                 type: integer
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId) || productId < 1) {
      return res.status(400).json({
        status: 400,
        message: "Invalid product ID",
      });
    }

    const { name, description, price, image, productTypeId } = req.body;

    let imageUrl = null;
    if (image) {
      let imageBuffer;
      const fileName = `product_${Date.now()}.jpg`;

      if (image.startsWith("http")) {
        const response = await axios.get(image, { responseType: "arraybuffer" });
        imageBuffer = Buffer.from(response.data, "binary");
      } else {
        imageBuffer = Buffer.from(image, "base64");
      }

      imageUrl = await uploadImageToFirebase(imageBuffer, fileName);
    }

    const updateData = {
      name,
      description,
      price,
      image: imageUrl,
      productTypeId,
    };

    const updatedProduct = await productService.updateProduct(productId, updateData);

    if (!updatedProduct) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Soft delete a product by setting isActive to false
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId) || productId < 1) {
      return res.status(400).json({
        status: 400,
        message: "Invalid product ID",
      });
    }

    const deleted = await productService.softDeleteProduct(productId);

    if (!deleted) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Product soft deleted successfully",
    });
  } catch (error) {
    console.error("Error soft deleting product:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

module.exports = router;

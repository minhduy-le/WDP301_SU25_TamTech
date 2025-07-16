const express = require("express");
const router = express.Router();
const productService = require("../services/productService");
const verifyToken = require("../middlewares/verifyToken");
const { uploadImageToFirebase } = require("../config/firebase");
const axios = require("axios");

// Define specific routes before generic :id route
/**
 * @swagger
 * /api/products/search-by-type-name:
 *   get:
 *     summary: Search products by exact product type name
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: typeName
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Exact name of the product type to search for
 *     responses:
 *       200:
 *         description: List of products matching the exact product type name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *         description: Invalid or mismatched product type name
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Product type name must match exactly or is required
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get("/search-by-type-name", async (req, res) => {
  try {
    const { typeName } = req.query;
    if (!typeName || typeof typeName !== "string" || typeName.trim() === "") {
      throw new Error("Product type name must match exactly or is required");
    }
    const products = await productService.searchProductsByTypeName(typeName.trim());
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error searching products by type name:", error);
    res.status(error.message.includes("Product type name") ? 400 : 500).send(error.message);
  }
});

/**
 * @swagger
 * /api/products/search-by-name-and-type:
 *   get:
 *     summary: Search products by partial name and product type ID
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Partial name to search for
 *       - in: query
 *         name: productTypeId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Product type ID to filter by
 *     responses:
 *       200:
 *         description: List of products matching the search term and product type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *         description: Invalid search term or product type ID
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 invalidName: { value: "Search term must be a non-empty string" }
 *                 invalidTypeId: { value: "ProductTypeId must be a positive integer" }
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get("/search-by-name-and-type", async (req, res) => {
  try {
    const { name, productTypeId } = req.query;
    const typeId = parseInt(productTypeId);
    const products = await productService.searchProductsByNameAndType(name, typeId);
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error searching products by name and type:", error);
    res
      .status(error.message.includes("Search term") || error.message.includes("ProductTypeId") ? 400 : 500)
      .send(error.message);
  }
});

/**
 * @swagger
 * /api/products/search-by-name-and-type-name:
 *   get:
 *     summary: Search products by partial product name and exact product type name
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Partial name to search for in products
 *       - in: query
 *         name: typeName
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Exact name of the product type to filter by
 *     responses:
 *       200:
 *         description: List of products matching the search term and exact product type name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *         description: Invalid search term or product type name
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 invalidName: { value: "Search term must be a non-empty string" }
 *                 invalidTypeName: { value: "Product type name must match exactly or is required" }
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get("/search-by-name-and-type-name", async (req, res) => {
  try {
    const { name, typeName } = req.query;
    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error("Search term must be a non-empty string");
    }
    if (!typeName || typeof typeName !== "string" || typeName.trim() === "") {
      throw new Error("Product type name must match exactly or is required");
    }
    const products = await productService.searchProductsByNameAndTypeName(name.trim(), typeName.trim());
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error searching products by name and type name:", error);
    res
      .status(error.message.includes("Search term") || error.message.includes("Product type name") ? 400 : 500)
      .send(error.message);
  }
});

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
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get("/best-seller", async (req, res) => {
  try {
    const products = await productService.getBestSellerProducts();
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error retrieving best seller products:", error);
    res.status(500).send(error.message);
  }
});

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products by name (partial match)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Name or part of the name to search for
 *     responses:
 *       200:
 *         description: List of products matching the search term
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *         description: Missing or invalid search term
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Search term must be a non-empty string
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get("/search", async (req, res) => {
  try {
    const { name } = req.query;
    const products = await productService.searchProductsByName(name);
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(error.message.includes("Search term") ? 400 : 500).send(error.message);
  }
});

/**
 * @swagger
 * /api/products/type/{productTypeId}:
 *   get:
 *     summary: Get all products by product type ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productTypeId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Product type ID
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: ProductTypeId must be a positive integer
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get("/type/:productTypeId", async (req, res) => {
  try {
    const productTypeId = parseInt(req.params.productTypeId);
    const products = await productService.getProductsByType(productTypeId);
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error retrieving products by type:", error);
    res.status(error.message.includes("ProductTypeId") ? 400 : 500).send(error.message);
  }
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get products with pagination, sort by price descending, and include average rating
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *                       averageRating:
 *                         type: number
 *                         description: Average rating of the product (0 if no ratings)
 *                         example: 4.50
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
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Page must be a positive integer
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const result = await productService.getProducts({ page, limit, offset });
    res.status(200).json({ products: result.products, totalPages: result.totalPages, currentPage: page });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res
      .status(
        error.message.includes("Page") || error.message.includes("Limit") || error.message.includes("Offset")
          ? 400
          : 500
      )
      .send(error.message);
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product with optional recipes
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
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: string
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: string
 *               price:
 *                 type: number
 *                 minimum: 1000
 *                 maximum: 1000000
 *                 example: 0
 *               image:
 *                 type: string
 *                 example: string
 *                 description: Must be a valid URL ending with .jpg, .jpeg, or .png, or base64 string with supported format
 *               productTypeId:
 *                 type: integer
 *                 minimum: 1
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
 *                       minimum: 1
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 1
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 missingFields: { value: "Name is required and must be a non-empty string" }
 *                 invalidPrice: { value: "Price must be a number between 1,000 and 1,000,000" }
 *                 invalidImage: { value: "Image URL must have .jpg, .jpeg, or .png extension" }
 *                 invalidRecipes: { value: "Each recipe must have a valid materialId and quantity" }
 *                 materialNotFound: { value: "Material with ID 5 not found" }
 *       401:
 *         description: Unauthorized
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description, price, image, productTypeId, recipes } = req.body;
    const userId = req.userId;

    let imageUrl = null;
    if (image) {
      let imageBuffer;
      const fileName = `product_${Date.now()}.jpg`;

      if (image.startsWith("http")) {
        const response = await axios.get(image, { responseType: "arraybuffer" });
        if (response.status !== 200) {
          throw new Error("Failed to fetch image from URL");
        }
        imageBuffer = Buffer.from(response.data, "binary");
      } else {
        imageBuffer = Buffer.from(image.split(",")[1], "base64");
      }

      imageUrl = await uploadImageToFirebase(imageBuffer, fileName);
    }

    const productData = {
      name,
      description,
      price,
      image: imageUrl || image, // Use processed imageUrl or original image
      productTypeId,
      createBy: userId,
      storeId: 1, // Adjust if dynamic storeId is needed
      recipes: recipes || [], // Default to empty array if recipes not provided
    };

    const product = await productService.createProduct(productData);

    res.status(201).json({ product });
  } catch (error) {
    console.error("Error creating product:", error);
    res
      .status(
        error.message.includes("Name") ||
          error.message.includes("Price") ||
          error.message.includes("ProductTypeId") ||
          error.message.includes("materialId") ||
          error.message.includes("quantity") ||
          error.message.includes("Description") ||
          error.message.includes("Image") ||
          error.message.includes("Material")
          ? 400
          : 500
      )
      .send(error.message);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: ProductId must be a positive integer
 *       404:
 *         description: Product not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Product not found or inactive
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.get("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await productService.getProductById(productId);
    res.status(200).json({ product });
  } catch (error) {
    console.error("Error retrieving product:", error);
    res
      .status(error.message.includes("ProductId") ? 400 : error.message.includes("not found") ? 404 : 500)
      .send(error.message);
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
 *           minimum: 1
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
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Updated Chocolate Cake
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Updated description
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 999999.99
 *                 example: 39.99
 *               image:
 *                 type: string
 *                 example: https://example.com/updated-image.jpg
 *               productTypeId:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 invalidId: { value: "ProductId must be a positive integer" }
 *                 invalidName: { value: "Name must be a non-empty string and cannot exceed 100 characters" }
 *                 invalidPrice: { value: "Price must be a number greater than 0 and less than 1,000,000" }
 *       401:
 *         description: Unauthorized
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: Product not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Product not found or inactive
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { name, description, price, image, productTypeId } = req.body;

    let imageUrl = null;
    if (image) {
      if (!image.match(/^(https:\/\/|data:image\/)/)) {
        throw new Error("Image must be a valid URL or base64 string");
      }
      let imageBuffer;
      const fileName = `product_${Date.now()}.jpg`;

      if (image.startsWith("http")) {
        const response = await axios.get(image, { responseType: "arraybuffer" });
        if (response.status !== 200) {
          throw new Error("Failed to fetch image from URL");
        }
        imageBuffer = Buffer.from(response.data, "binary");
      } else {
        imageBuffer = Buffer.from(image.split(",")[1], "base64");
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
    res.status(200).json({ product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(
        error.message.includes("ProductId") ||
          error.message.includes("Name") ||
          error.message.includes("Price") ||
          error.message.includes("ProductTypeId") ||
          error.message.includes("Description") ||
          error.message.includes("Image")
          ? 400
          : error.message.includes("not found")
          ? 404
          : 500
      )
      .send(error.message);
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
 *           minimum: 1
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product soft deleted successfully
 *       400:
 *         description: Invalid product ID
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: ProductId must be a positive integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: Product not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Product not found or inactive
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    await productService.softDeleteProduct(productId);
    res.status(200).json({ message: "Product soft deleted successfully" });
  } catch (error) {
    console.error("Error soft deleting product:", error);
    res
      .status(error.message.includes("ProductId") ? 400 : error.message.includes("not found") ? 404 : 500)
      .send(error.message);
  }
});

module.exports = router;

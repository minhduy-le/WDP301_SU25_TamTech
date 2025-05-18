const Product = require("../models/product");
const { uploadImageToFirebase } = require("../config/firebase");
const httpErrors = require("http-errors");
const ProductType = require("../models/productType");

const createProduct = async (productData, imageFile) => {
  try {
    // Validate required fields
    if (!productData.name || !productData.price || !productData.productTypeId || !productData.createBy) {
      throw httpErrors.BadRequest("Name, price, productTypeId, and createBy are required");
    }

    // Handle image upload if provided
    let imageUrl = null;
    if (imageFile) {
      const fileName = `${Date.now()}_${imageFile.originalname}`;
      imageUrl = await uploadImageToFirebase(imageFile.buffer, fileName);
      if (!imageUrl) {
        throw httpErrors.InternalServerError("Failed to upload image to Firebase");
      }
    }

    // Set default branchId to 1 if not provided
    const finalProductData = {
      ...productData,
      image: imageUrl,
      branchId: productData.branchId || 1,
      createAt: new Date(),
    };

    // Create product in database
    const product = await Product.create(finalProductData);

    return product;
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      throw httpErrors.BadRequest(error.message);
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
      throw httpErrors.BadRequest("Invalid productTypeId or branchId");
    }
    throw error;
  }
};

const getAllProducts = async () => {
  try {
    const products = await Product.findAll({
      where: { isActive: true }, // Chỉ lấy sản phẩm có isActive là true
      attributes: ["productId", "name", "price", "image", "productTypeId", "createBy", "createAt"],
      include: [
        {
          model: ProductType,
          as: "ProductType",
          attributes: ["productTypeId", "name"],
        },
      ],
    });
    return products;
  } catch (error) {
    throw httpErrors.InternalServerError("Failed to retrieve products");
  }
};

const getProductById = async (productId) => {
  try {
    const product = await Product.findOne({
      where: { productId, isActive: true }, // Chỉ lấy sản phẩm có isActive là true
      include: [
        {
          model: ProductType,
          as: "ProductType",
          attributes: ["productTypeId", "name"],
        },
      ],
    });
    if (!product) {
      throw httpErrors.NotFound("Product not found or inactive");
    }
    return product;
  } catch (error) {
    if (error.name === "SequelizeDatabaseError") {
      throw httpErrors.InternalServerError("Database error occurred");
    }
    if (error.name === "NotFound") {
      throw error;
    }
    throw httpErrors.InternalServerError("Failed to retrieve product");
  }
};

const getProductsByTypeId = async (productTypeId) => {
  try {
    const products = await Product.findAll({
      where: { productTypeId, isActive: true }, // Chỉ lấy sản phẩm có isActive là true
      attributes: ["productId", "name", "price", "image", "productTypeId", "createBy", "createAt"],
      include: [
        {
          model: ProductType,
          as: "ProductType",
          attributes: ["productTypeId", "name"],
        },
      ],
    });
    if (products.length === 0) {
      throw httpErrors.NotFound("No active products found for this product type");
    }
    return products;
  } catch (error) {
    if (error.name === "NotFound") {
      throw error;
    }
    throw httpErrors.InternalServerError("Failed to retrieve products by type");
  }
};

module.exports = { createProduct, getAllProducts, getProductById, getProductsByTypeId };

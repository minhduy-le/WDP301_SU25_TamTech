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
    }

    // Create product in database
    const product = await Product.create({
      ...productData,
      image: imageUrl,
      createAt: new Date(),
    });

    return product;
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      throw httpErrors.BadRequest(error.message);
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
      throw httpErrors.BadRequest("Invalid productTypeId");
    }
    throw error;
  }
};

const getAllProducts = async () => {
  try {
    const products = await Product.findAll({
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
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: ProductType,
          as: "ProductType",
          attributes: ["productTypeId", "name"],
        },
      ],
    });
    if (!product) {
      throw httpErrors.NotFound("Product not found");
    }
    return product;
  } catch (error) {
    if (error.name === "NotFound") {
      throw error;
    }
    throw httpErrors.InternalServerError("Failed to retrieve product");
  }
};

module.exports = { createProduct, getAllProducts, getProductById };

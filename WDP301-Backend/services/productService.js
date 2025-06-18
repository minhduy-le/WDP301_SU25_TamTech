const sequelize = require("../config/database");
const Product = require("../models/product");
const ProductRecipe = require("../models/ProductRecipe");
const Material = require("../models/material");
const { Op } = require("sequelize");
const ProductType = require("../models/productType");

const validateProductData = (data) => {
  const { name, price, productTypeId, recipes, description, image } = data;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new Error("Name is required and must be a non-empty string");
  }
  if (name.trim().length > 100) {
    throw new Error("Name cannot exceed 100 characters");
  }
  if (description && (typeof description !== "string" || description.length > 1000)) {
    throw new Error("Description must be a string and cannot exceed 1000 characters");
  }
  if (typeof price !== "number" || price < 1000 || price > 1000000) {
    throw new Error("Price must be a number between 1,000 and 1,000,000");
  }
  if (!Number.isInteger(productTypeId) || productTypeId < 1) {
    throw new Error("ProductTypeId must be a positive integer");
  }

  // Validate image extension if image is provided
  if (image && typeof image === "string") {
    // Check if it's a URL or base64 string
    if (image.startsWith("http")) {
      // For URLs, check the extension in the URL
      const urlPattern = /\.(jpg|jpeg|png)(\?.*)?$/i;
      if (!urlPattern.test(image)) {
        throw new Error("Image URL must have .jpg, .jpeg, or .png extension");
      }
    } else if (image.startsWith("data:image/")) {
      // For base64, check the MIME type
      const base64Pattern = /^data:image\/(jpeg|jpg|png);base64,/i;
      if (!base64Pattern.test(image)) {
        throw new Error("Image must be in .jpg, .jpeg, or .png format");
      }
    } else {
      throw new Error("Image must be a valid URL or base64 string with .jpg, .jpeg, or .png format");
    }
  }

  if (recipes) {
    if (!Array.isArray(recipes)) {
      throw new Error("Recipes must be an array");
    }
    for (const recipe of recipes) {
      if (!Number.isInteger(recipe.materialId) || recipe.materialId < 1) {
        throw new Error("Each recipe must have a valid materialId (positive integer)");
      }
      if (!Number.isInteger(recipe.quantity) || recipe.quantity <= 0) {
        throw new Error("Each recipe must have a valid quantity (positive integer)");
      }
    }
  }
};

const createProduct = async (productData) => {
  const { name, description, price, image, productTypeId, createBy, storeId, recipes = [] } = productData;

  validateProductData({ name, price, productTypeId, recipes, description, image });

  const transaction = await sequelize.transaction();

  try {
    // Check for unique name
    const existingProduct = await Product.findOne({
      where: { name: name.trim(), isActive: true },
      transaction,
    });
    if (existingProduct) {
      throw new Error("Product name already exists");
    }

    // Check if materials exist for provided recipes
    if (recipes.length > 0) {
      for (const recipe of recipes) {
        const material = await Material.findByPk(recipe.materialId, { transaction });
        if (!material) {
          throw new Error(`Material with ID ${recipe.materialId} not found`);
        }
      }
    }

    const product = await Product.create(
      {
        name: name.trim(),
        description: description ? description.trim() : null,
        price,
        image,
        productTypeId,
        createBy,
        storeId,
      },
      { transaction }
    );

    if (recipes.length > 0) {
      for (const recipe of recipes) {
        await ProductRecipe.create(
          {
            productId: product.productId,
            materialId: recipe.materialId,
            quantity: recipe.quantity,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    return await Product.findByPk(product.productId, {
      include: [
        { model: ProductRecipe, as: "ProductRecipes", include: [{ model: Material, as: "Material" }] },
        { model: require("../models/productType"), as: "ProductType" },
      ],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getProducts = async ({ page, limit, offset }) => {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Page must be a positive integer");
  }
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Limit must be a positive integer");
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error("Offset must be a non-negative integer");
  }

  const { count, rows } = await Product.findAndCountAll({
    where: { isActive: true },
    limit,
    offset,
    order: [["price", "DESC"]],
    include: [
      { model: ProductRecipe, as: "ProductRecipes", include: [{ model: Material, as: "Material" }] },
      { model: require("../models/productType"), as: "ProductType" },
      { model: require("../models/store"), as: "Store" },
    ],
  });

  return {
    products: rows,
    totalPages: Math.ceil(count / limit),
  };
};

const getProductsByType = async (productTypeId) => {
  if (!Number.isInteger(productTypeId) || productTypeId < 1) {
    throw new Error("ProductTypeId must be a positive integer");
  }

  const products = await Product.findAll({
    where: { productTypeId, isActive: true },
    include: [
      { model: ProductRecipe, as: "ProductRecipes", include: [{ model: Material, as: "Material" }] },
      { model: require("../models/productType"), as: "ProductType" },
      { model: require("../models/store"), as: "Store" },
    ],
  });

  return products;
};

const updateProduct = async (productId, updateData) => {
  if (!Number.isInteger(productId) || productId < 1) {
    throw new Error("ProductId must be a positive integer");
  }

  const { name, description, price, image, productTypeId } = updateData;
  if (name !== undefined && (typeof name !== "string" || name.trim() === "" || name.trim().length > 100)) {
    throw new Error("Name must be a non-empty string and cannot exceed 100 characters");
  }
  if (description !== undefined && (typeof description !== "string" || description.length > 1000)) {
    throw new Error("Description must be a string and cannot exceed 1000 characters");
  }
  if (price !== undefined && (typeof price !== "number" || price < 1000 || price > 1000000)) {
    throw new Error("Price must be a number between 1,000 and 1,000,000");
  }
  if (productTypeId !== undefined && (!Number.isInteger(productTypeId) || productTypeId < 1)) {
    throw new Error("ProductTypeId must be a positive integer");
  }

  // Validate image extension if image is provided for update
  if (image !== undefined && image && typeof image === "string") {
    // Check if it's a URL or base64 string
    if (image.startsWith("http")) {
      // For URLs, check the extension in the URL
      const urlPattern = /\.(jpg|jpeg|png)(\?.*)?$/i;
      if (!urlPattern.test(image)) {
        throw new Error("Image URL must have .jpg, .jpeg, or .png extension");
      }
    } else if (image.startsWith("data:image/")) {
      // For base64, check the MIME type
      const base64Pattern = /^data:image\/(jpeg|jpg|png);base64,/i;
      if (!base64Pattern.test(image)) {
        throw new Error("Image must be in .jpg, .jpeg, or .png format");
      }
    } else {
      throw new Error("Image must be a valid URL or base64 string with .jpg, .jpeg, or .png format");
    }
  }

  const product = await Product.findByPk(productId);
  if (!product || !product.isActive) {
    throw new Error("Product not found or inactive");
  }

  // Check for unique name (excluding the current product)
  if (name !== undefined) {
    const existingProduct = await Product.findOne({
      where: {
        name: name.trim(),
        productId: { [Op.ne]: productId },
        isActive: true,
      },
    });
    if (existingProduct) {
      throw new Error("Product name already exists");
    }
  }

  await product.update({
    name: name ? name.trim() : product.name,
    description: description !== undefined ? (description ? description.trim() : null) : product.description,
    price: price !== undefined ? price : product.price,
    image: image || product.image,
    productTypeId: productTypeId || product.productTypeId,
  });

  return await Product.findByPk(productId, {
    include: [
      { model: ProductRecipe, as: "ProductRecipes", include: [{ model: Material, as: "Material" }] },
      { model: require("../models/productType"), as: "ProductType" },
      { model: require("../models/store"), as: "Store" },
    ],
  });
};

const softDeleteProduct = async (productId) => {
  if (!Number.isInteger(productId) || productId < 1) {
    throw new Error("ProductId must be a positive integer");
  }

  const product = await Product.findByPk(productId);
  if (!product || !product.isActive) {
    throw new Error("Product not found or inactive");
  }

  await product.update({ isActive: false });
  return true;
};

const getProductById = async (productId) => {
  if (!Number.isInteger(productId) || productId < 1) {
    throw new Error("ProductId must be a positive integer");
  }

  const product = await Product.findByPk(productId, {
    where: { isActive: true },
    include: [
      { model: ProductRecipe, as: "ProductRecipes", include: [{ model: Material, as: "Material" }] },
      { model: require("../models/productType"), as: "ProductType" },
      { model: require("../models/store"), as: "Store" },
    ],
  });

  if (!product) {
    throw new Error("Product not found or inactive");
  }

  return product;
};

const getBestSellerProducts = async () => {
  const products = await Product.findAll({
    where: {
      productTypeId: [1, 3],
      isActive: true,
    },
    include: [
      {
        model: require("../models/orderItem"),
        as: "OrderItems",
        attributes: [],
        required: true,
      },
      {
        model: require("../models/productType"),
        as: "ProductType",
        attributes: ["productTypeId", "name"],
      },
    ],
    attributes: ["productId", "name", "description", "price", "image"],
    group: ["Product.productId"],
    order: [["productTypeId", "ASC"]],
  });

  return products;
};

const searchProductsByName = async (searchTerm) => {
  if (!searchTerm || typeof searchTerm !== "string" || searchTerm.trim() === "") {
    throw new Error("Search term must be a non-empty string");
  }

  const products = await Product.findAll({
    where: {
      name: { [Op.like]: `%${searchTerm.trim()}%` },
      isActive: true,
    },
    attributes: ["productId", "name", "description", "price", "image"],
    include: [
      { model: ProductRecipe, as: "ProductRecipes", include: [{ model: Material, as: "Material" }] },
      { model: require("../models/productType"), as: "ProductType" },
      { model: require("../models/store"), as: "Store" },
    ],
    order: [["name", "ASC"]],
  });

  return products;
};

const searchProductsByTypeName = async (typeName) => {
  if (!typeName || typeof typeName !== "string" || typeName.trim() === "") {
    throw new Error("Product type name must match exactly or is required");
  }

  const productType = await ProductType.findOne({
    where: { name: typeName },
  });

  if (!productType) {
    throw new Error("Product type name must match exactly or is required");
  }

  const products = await Product.findAll({
    where: {
      productTypeId: productType.productTypeId,
      isActive: true,
    },
    include: [
      { model: ProductRecipe, as: "ProductRecipes", include: [{ model: Material, as: "Material" }] },
      { model: require("../models/productType"), as: "ProductType" },
      { model: require("../models/store"), as: "Store" },
    ],
    order: [["name", "ASC"]],
  });

  return products;
};

module.exports = {
  createProduct,
  getProducts,
  getProductsByType,
  updateProduct,
  softDeleteProduct,
  getProductById,
  getBestSellerProducts,
  searchProductsByName,
  searchProductsByTypeName,
};

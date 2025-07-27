const sequelize = require("../config/database");
const Product = require("../models/product");
const ProductRecipe = require("../models/ProductRecipe");
const Material = require("../models/material");
const { Op } = require("sequelize");
const ProductType = require("../models/productType");

const validateProductData = async (data, isUpdate = false) => {
  const errors = [];
  const { name, price, productTypeId, recipes, description, image } = data;

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      errors.push("Name must be a non-empty string");
    } else if (name.trim().length > 1000) {
      errors.push("Name cannot exceed product name length limit");
    }
  } else if (!isUpdate) {
    errors.push("Name is required");
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.length > 1000) {
      errors.push("Description must be a string and cannot exceed description length limit");
    }
  }

  if (price !== undefined) {
    if (typeof price !== "number" || price < 1000 || price > 1000000) {
      errors.push("Price must be a number between 1000 and 1000000");
    }
  } else if (!isUpdate) {
    errors.push("Price is required");
  }

  if (productTypeId !== undefined) {
    if (!Number.isInteger(productTypeId) || productTypeId < 1) {
      errors.push("ProductTypeId must be a positive integer");
    } else {
      const productType = await ProductType.findByPk(productTypeId);
      if (!productType) {
        errors.push(`ProductType with ID ${productTypeId} not found`);
      }
    }
  } else if (!isUpdate) {
    errors.push("ProductTypeId is required");
  }

  if (image !== undefined) {
    if (typeof image !== "string" || image.trim() === "") {
      errors.push("Image must be a non-empty string");
    }
  } else if (!isUpdate) {
    errors.push("Image is required");
  }

  if (recipes !== undefined) {
    if (!Array.isArray(recipes)) {
      errors.push("Recipes must be an array");
    } else {
      for (const recipe of recipes) {
        if (!Number.isInteger(recipe.materialId) || recipe.materialId < 1) {
          errors.push(`Each recipe must have a valid materialId (positive integer): ${recipe.materialId}`);
        } else {
          const material = await Material.findByPk(recipe.materialId);
          if (!material) {
            errors.push(`Material with ID ${recipe.materialId} not found`);
          } else if (!Number.isInteger(recipe.quantity) || recipe.quantity <= 0) {
            errors.push(`Each recipe must have a valid quantity (positive integer): ${recipe.quantity}`);
          } else if (material.quantity < recipe.quantity) {
            errors.push(
              `Insufficient quantity for material ID ${recipe.materialId}: available ${material.quantity}, required ${recipe.quantity}`
            );
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }
};

// Rest of the file remains unchanged...
const createProduct = async (productData) => {
  const { name, description, price, image, productTypeId, createBy, storeId, recipes = [] } = productData;

  await validateProductData({ name, description, price, image, productTypeId, recipes });

  const transaction = await sequelize.transaction();

  try {
    const existingProduct = await Product.findOne({
      where: { name: name.trim(), isActive: true },
      transaction,
    });
    if (existingProduct) {
      throw new Error("Product name already exists");
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
      { transaction: transaction }
    );

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

const updateProduct = async (productId, updateData) => {
  if (!Number.isInteger(productId) || productId < 1) {
    throw new Error("ProductId must be a positive integer");
  }

  const { name, description, price, image, productTypeId, recipes } = updateData;

  await validateProductData({ name, description, price, image, productTypeId, recipes }, true);

  const transaction = await sequelize.transaction();

  try {
    const product = await Product.findByPk(productId, { transaction });
    if (!product || !product.isActive) {
      throw new Error("Product not found or inactive");
    }

    if (name !== undefined) {
      const existingProduct = await Product.findOne({
        where: {
          name: name.trim(),
          productId: { [Op.ne]: productId },
          isActive: true,
        },
        transaction,
      });
      if (existingProduct) {
        throw new Error("Product name already exists");
      }
    }

    await product.update(
      {
        name: name ? name.trim() : product.name,
        description: description !== undefined ? (description ? description.trim() : null) : product.description,
        price: price !== undefined ? price : product.price,
        image: image !== undefined ? image : product.image,
        productTypeId: productTypeId !== undefined ? productTypeId : product.productTypeId,
      },
      { transaction }
    );

    if (recipes !== undefined && Array.isArray(recipes)) {
      await ProductRecipe.destroy({ where: { productId }, transaction });
      for (const recipe of recipes) {
        await ProductRecipe.create(
          {
            productId,
            materialId: recipe.materialId,
            quantity: recipe.quantity,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    return await Product.findByPk(productId, {
      include: [
        { model: ProductRecipe, as: "ProductRecipes", include: [{ model: Material, as: "Material" }] },
        { model: require("../models/productType"), as: "ProductType" },
        { model: require("../models/store"), as: "Store" },
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

  const totalCount = await Product.count({ where: { isActive: true } });

  const products = await Product.findAll({
    where: { isActive: true },
    limit,
    offset,
    order: [["price", "DESC"]],
    attributes: {
      include: [
        [
          sequelize.literal(
            `(SELECT CAST(IFNULL(AVG(rating), 0) AS DECIMAL(10,1)) FROM feedback WHERE feedback.productId = Product.productId)`
          ),
          "averageRating",
        ],
      ],
    },
    include: [
      { model: ProductRecipe, as: "ProductRecipes", include: [{ model: Material, as: "Material" }] },
      { model: require("../models/productType"), as: "ProductType" },
      { model: require("../models/store"), as: "Store" },
    ],
  });

  return {
    products,
    totalPages: Math.ceil(totalCount / limit),
  };
};

const getProductsByType = async (productTypeId) => {
  if (!Number.isInteger(productTypeId) || productTypeId < 1) {
    throw new Error("ProductTypeId must be a positive integer");
  }

  const products = await Product.findAll({
    where: { productTypeId, isActive: true },
    attributes: {
      include: [
        [
          sequelize.literal(
            `(SELECT CAST(IFNULL(AVG(rating), 0) AS DECIMAL(10,1)) FROM feedback WHERE feedback.productId = Product.productId)`
          ),
          "averageRating",
        ],
      ],
    },
    include: [
      { model: ProductRecipe, as: "ProductRecipes", include: [{ model: Material, as: "Material" }] },
      { model: require("../models/productType"), as: "ProductType" },
      { model: require("../models/store"), as: "Store" },
    ],
  });

  return products;
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
    group: ["Product.productId", "ProductType.productTypeId"],
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

const searchProductsByNameAndType = async (searchTerm, productTypeId) => {
  if (!searchTerm || typeof searchTerm !== "string" || searchTerm.trim() === "") {
    throw new Error("Search term must be a non-empty string");
  }
  if (!Number.isInteger(productTypeId) || productTypeId < 1) {
    throw new Error("ProductTypeId must be a positive integer");
  }

  const products = await Product.findAll({
    where: {
      name: { [Op.like]: `%${searchTerm.trim()}%` },
      productTypeId,
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

const searchProductsByNameAndTypeName = async (searchTerm, typeName) => {
  if (!searchTerm || typeof searchTerm !== "string" || searchTerm.trim() === "") {
    throw new Error("Search term must be a non-empty string");
  }
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
      name: { [Op.like]: `%${searchTerm.trim()}%` },
      productTypeId: productType.productTypeId,
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
  searchProductsByNameAndType,
  searchProductsByNameAndTypeName,
};
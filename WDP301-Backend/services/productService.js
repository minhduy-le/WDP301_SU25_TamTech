const sequelize = require("../config/database");
const Product = require("../models/product");
const ProductRecipe = require("../models/ProductRecipe");
const Material = require("../models/material");
const { Op } = require("sequelize");

const createProduct = async (productData) => {
  const { name, description, price, image, productTypeId, createBy, storeId, recipes } = productData;

  const transaction = await sequelize.transaction();

  try {
    for (const recipe of recipes) {
      const material = await Material.findByPk(recipe.materialId, { transaction });
      if (!material) {
        throw new Error(`Material with ID ${recipe.materialId} not found`);
      }
      if (material.quantity < recipe.quantity) {
        throw new Error(
          `Insufficient quantity for material ${material.name}. Available: ${material.quantity}, Required: ${recipe.quantity}`
        );
      }
    }

    const product = await Product.create(
      {
        name,
        description,
        price,
        image,
        productTypeId,
        createBy,
        storeId,
      },
      { transaction }
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

      await Material.update(
        { quantity: sequelize.literal(`quantity - ${recipe.quantity}`) },
        { where: { materialId: recipe.materialId }, transaction }
      );
    }

    await transaction.commit();

    const createdProduct = await Product.findByPk(product.productId, {
      include: [{ model: require("../models/ProductRecipe"), as: "ProductRecipes" }],
    });

    return createdProduct;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getProducts = async ({ page, limit, offset }) => {
  const { count, rows } = await Product.findAndCountAll({
    where: { isActive: true },
    limit,
    offset,
    order: [["price", "DESC"]],
    include: [
      { model: require("../models/ProductRecipe"), as: "ProductRecipes" },
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
  const products = await Product.findAll({
    where: { productTypeId, isActive: true },
    include: [
      { model: require("../models/ProductRecipe"), as: "ProductRecipes" },
      { model: require("../models/productType"), as: "ProductType" },
      { model: require("../models/store"), as: "Store" },
    ],
  });

  return products;
};

const updateProduct = async (productId, updateData) => {
  const product = await Product.findByPk(productId);
  if (!product || !product.isActive) {
    return null;
  }

  const { name, description, price, image, productTypeId } = updateData;

  await product.update({
    name: name || product.name,
    description: description !== undefined ? description : product.description,
    price: price || product.price,
    image: image || product.image,
    productTypeId: productTypeId || product.productTypeId,
  });

  return await Product.findByPk(productId, {
    include: [
      { model: require("../models/ProductRecipe"), as: "ProductRecipes" },
      { model: require("../models/productType"), as: "ProductType" },
      { model: require("../models/store"), as: "Store" },
    ],
  });
};

const softDeleteProduct = async (productId) => {
  const product = await Product.findByPk(productId);
  if (!product || !product.isActive) {
    return false;
  }

  await product.update({ isActive: false });
  return true;
};

const getProductById = async (productId) => {
  const product = await Product.findByPk(productId, {
    where: { isActive: true },
    include: [
      {
        model: require("../models/ProductRecipe"),
        as: "ProductRecipes",
        include: [{ model: Material, as: "Material" }],
      },
      { model: require("../models/productType"), as: "ProductType" },
      { model: require("../models/store"), as: "Store" },
    ],
  });

  return product;
};

const getBestSellerProducts = async () => {
  const products = await Product.findAll({
    where: {
      productTypeId: [1, 3], // Chỉ lấy productTypeId 1 hoặc 3
      isActive: true, // Chỉ lấy sản phẩm đang hoạt động
    },
    include: [
      {
        model: require("../models/OrderItem"),
        as: "OrderItems", // Liên kết với OrderItem để kiểm tra sản phẩm có trong đơn hàng
        attributes: [], // Không cần lấy thuộc tính của OrderItem
        required: true, // Chỉ lấy sản phẩm có trong order_items
      },
      {
        model: require("../models/productType"),
        as: "ProductType",
        attributes: ["productTypeId", "name"], // Lấy thông tin productType
      },
    ],
    attributes: ["productId", "name", "description", "price", "image"], // Chỉ lấy các trường yêu cầu
    group: ["Product.productId"], // Tránh trùng lặp sản phẩm
    order: [["productTypeId", "ASC"]], // Sắp xếp theo productTypeId tăng dần
  });

  return products;
};

const searchProductsByName = async (searchTerm) => {
  const products = await Product.findAll({
    where: {
      name: {
        [Op.like]: `%${searchTerm}%`, // Tìm kiếm chuỗi con trong name, không phân biệt hoa thường
      },
      isActive: true, // Chỉ lấy sản phẩm đang hoạt động
    },
    attributes: ["productId", "name", "description", "price", "image"], // Chỉ lấy các trường cần thiết
    include: [
      { model: require("../models/ProductRecipe"), as: "ProductRecipes" },
      { model: require("../models/productType"), as: "ProductType" },
      { model: require("../models/store"), as: "Store" },
    ],
    order: [["name", "ASC"]], // Sắp xếp theo tên tăng dần
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
};

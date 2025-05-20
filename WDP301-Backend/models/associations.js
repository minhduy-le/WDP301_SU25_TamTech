const Product = require("./product");
const ProductType = require("./productType");
const Store = require("./store");
const Material = require("./material");
const ProductRecipe = require("./ProductRecipe");
const User = require("./user");
const Order = require("./order");
const OrderItem = require("./orderItem");
const PaymentMethod = require("./paymentMethod");
const OrderStatus = require("./orderStatus");

// Define relationships for existing models
Product.belongsTo(ProductType, { foreignKey: "productTypeId", as: "ProductType" });
Product.belongsTo(Store, { foreignKey: "storeId", as: "Store" });
Product.hasMany(ProductRecipe, { foreignKey: "productId", as: "ProductRecipes" });

Store.hasMany(Product, { foreignKey: "storeId", as: "Products" });
Store.hasMany(Material, { foreignKey: "storeId", as: "Materials" });

Material.belongsTo(Store, { foreignKey: "storeId", as: "Store" });
Material.hasMany(ProductRecipe, { foreignKey: "materialId", as: "ProductRecipes" });

ProductRecipe.belongsTo(Product, { foreignKey: "productId", as: "Product" });
ProductRecipe.belongsTo(Material, { foreignKey: "materialId", as: "Material" });

// Define relationships for new models
Order.belongsTo(User, { foreignKey: "userId", as: "User" });
Order.belongsTo(PaymentMethod, { foreignKey: "paymentMethodId", as: "PaymentMethod" });
Order.belongsTo(OrderStatus, { foreignKey: "orderStatusId", as: "OrderStatus" });
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "OrderItems" });

User.hasMany(Order, { foreignKey: "userId", as: "Orders" });

OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "Order" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "Product" });

Product.hasMany(OrderItem, { foreignKey: "productId", as: "OrderItems" });

module.exports = {
  Product,
  ProductType,
  Store,
  Material,
  ProductRecipe,
  User,
  Order,
  OrderItem,
  PaymentMethod,
  OrderStatus,
};

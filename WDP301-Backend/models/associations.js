const Product = require("./product");
const ProductType = require("./productType");
const Store = require("./store");
const Material = require("./material");
const ProductRecipe = require("./ProductRecipe");

// Define relationships
Product.belongsTo(ProductType, { foreignKey: "productTypeId", as: "ProductType" });
Product.belongsTo(Store, { foreignKey: "storeId", as: "Store" });
Product.hasMany(ProductRecipe, { foreignKey: "productId", as: "ProductRecipes" });

Store.hasMany(Product, { foreignKey: "storeId", as: "Products" });
Store.hasMany(Material, { foreignKey: "storeId", as: "Materials" });

Material.belongsTo(Store, { foreignKey: "storeId", as: "Store" });
Material.hasMany(ProductRecipe, { foreignKey: "materialId", as: "ProductRecipes" });

ProductRecipe.belongsTo(Product, { foreignKey: "productId", as: "Product" });
ProductRecipe.belongsTo(Material, { foreignKey: "materialId", as: "Material" });

module.exports = { Product, ProductType, Store, Material, ProductRecipe };

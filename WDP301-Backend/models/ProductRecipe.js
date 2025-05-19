const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("./product");
const Material = require("./material");

const ProductRecipe = sequelize.define(
  "ProductRecipe",
  {
    productRecipeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "productId",
      },
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "materials",
        key: "materialId",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "product_recipes",
    timestamps: false,
  }
);

// Set up relationships
ProductRecipe.belongsTo(Product, { foreignKey: "productId", as: "Product" });
ProductRecipe.belongsTo(Material, { foreignKey: "materialId", as: "Material" });

module.exports = ProductRecipe;

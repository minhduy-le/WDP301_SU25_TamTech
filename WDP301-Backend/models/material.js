const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Store = require("./store");
const ProductRecipe = require("./ProductRecipe");

const Material = sequelize.define(
  "Material",
  {
    materialId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "stores",
        key: "storeId",
      },
    },
  },
  {
    tableName: "materials",
    timestamps: false,
  }
);

// Set up relationships
Material.belongsTo(Store, { foreignKey: "storeId", as: "Store" });
Material.hasMany(ProductRecipe, { foreignKey: "materialId", as: "ProductRecipes" });

module.exports = Material;

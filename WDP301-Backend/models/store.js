const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("./product");
const Material = require("./material");

const Store = sequelize.define(
  "Store",
  {
    storeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "stores",
    timestamps: false,
  }
);

// Set up relationships
Store.hasMany(Product, { foreignKey: "storeId", as: "Products" });
Store.hasMany(Material, { foreignKey: "storeId", as: "Materials" });

module.exports = Store;

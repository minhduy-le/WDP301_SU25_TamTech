const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductType = sequelize.define(
  "ProductType",
  {
    productTypeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "product_types",
    timestamps: false,
  }
);

module.exports = ProductType;

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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "product_types",
    timestamps: false,
  }
);

module.exports = ProductType;

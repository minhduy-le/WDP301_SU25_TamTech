const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
  "Product",
  {
    productId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    createAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    productTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "product_types",
        key: "productTypeId",
      },
    },
    createBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "stores",
        key: "storeId",
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "products",
    timestamps: false,
  }
);

module.exports = Product;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const ProductType = require("./productType");

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
      type: DataTypes.STRING(255),
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
        model: ProductType,
        key: "productTypeId",
      },
    },
    createBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: "products",
    timestamps: false,
  }
);

Product.belongsTo(ProductType, { foreignKey: "productTypeId" });

module.exports = Product;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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
    barcode: {
      type: DataTypes.STRING(767),
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
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    expireDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    timeExpired: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    isExpired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "materials",
    timestamps: false,
  }
);

module.exports = Material;

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

module.exports = Material;

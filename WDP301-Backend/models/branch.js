const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Branch = sequelize.define(
  "Branch",
  {
    branchId: {
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
    provinnce: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "branches",
    timestamps: false,
  }
);

module.exports = Branch;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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
    startTime: {
      type: DataTypes.TIME,
    },
    endTime: {
      type: DataTypes.TIME,
    },
  },
  {
    tableName: "stores",
    timestamps: false,
  }
);

module.exports = Store;

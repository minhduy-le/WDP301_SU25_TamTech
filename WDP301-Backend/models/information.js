const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Information = sequelize.define(
  "Information",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "information",
    timestamps: false,
  }
);

module.exports = Information;

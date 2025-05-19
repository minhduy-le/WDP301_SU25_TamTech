const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    phone_number: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isBan: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    member_point: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    member_rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    role: {
      type: DataTypes.ENUM("Admin", "User", "Staff", "Shipper"),
      allowNull: false,
      defaultValue: "User",
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

module.exports = User;

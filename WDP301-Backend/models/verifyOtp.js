const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VerifyOtp = sequelize.define(
  "VerifyOtp",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "verify_otps",
    timestamps: false,
  }
);

module.exports = VerifyOtp;

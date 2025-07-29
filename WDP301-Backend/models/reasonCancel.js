const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReasonCancel = sequelize.define(
  "ReasonCancel",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    certificationRefund: {
      type: DataTypes.STRING(1000),
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "reason_cancels",
    timestamps: true,
  }
);

module.exports = ReasonCancel;

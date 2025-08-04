const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FcmToken = sequelize.define(
  "FcmToken",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fcmToken: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "fcm_tokens",
    timestamps: true,
  }
);

module.exports = FcmToken;

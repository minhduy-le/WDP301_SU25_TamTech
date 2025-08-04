const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PromotionType = sequelize.define(
  "PromotionType",
  {
    promotionTypeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "promotion_types",
    timestamps: false,
  }
);

module.exports = PromotionType;

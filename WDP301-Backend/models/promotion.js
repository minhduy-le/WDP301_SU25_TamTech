const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Promotion = sequelize.define(
  "Promotion",
  {
    promotionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    promotionTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "promotion_types",
        key: "promotionTypeId",
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    minOrderAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    discountAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    NumberCurrentUses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxNumberOfUses: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "promotions",
    timestamps: true,
  }
);

module.exports = Promotion;

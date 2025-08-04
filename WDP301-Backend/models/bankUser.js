const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BankUserInformation = sequelize.define("BankUserInformation", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bankNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = BankUserInformation;

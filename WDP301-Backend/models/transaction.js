const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Transaction = sequelize.define(
  "Transaction",
  {
    transactionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "orders",
        key: "orderId",
      },
    },
    payment_method_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "payment_methods",
        key: "paymentMethodId",
      },
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    transaction_code: {
      type: DataTypes.STRING,
      allowNull: true, // Mã giao dịch từ cổng thanh toán
    },
    status: {
      type: DataTypes.STRING(50), // Ví dụ: 'PAID', 'FAILED'
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    transaction_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "transactions",
    timestamps: false,
  }
);

module.exports = Transaction;

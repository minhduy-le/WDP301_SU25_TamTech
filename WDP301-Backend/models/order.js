const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
  "Order",
  {
    orderId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "stores",
        key: "storeId",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    order_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    order_discount_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    order_discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    order_point_earn: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    order_shipping_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    order_subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    payment_method_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "payment_methods",
        key: "paymentMethodId",
      },
    },
    assignToShipperId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    shipped_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "order_statuses",
        key: "orderStatusId",
      },
    },
    certificationOfDelivered: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    note: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    order_create_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    order_delivery_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    payment_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    order_address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    invoiceUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    expired_payment_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cookedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    cookedTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: false,
  }
);

module.exports = Order;

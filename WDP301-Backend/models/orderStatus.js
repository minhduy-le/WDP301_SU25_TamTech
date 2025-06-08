const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrderStatus = sequelize.define(
  "OrderStatus",
  {
    orderStatusId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Paid", "Delivering", "Delivered", "Canceled", "Preparing", "Cooked", "Approved"),
      allowNull: false,
    },
  },
  {
    tableName: "order_statuses",
    timestamps: false,
  }
);

// Pre-populate the OrderStatus table with the allowed values
(async () => {
  await OrderStatus.sync({ force: false });
  const statuses = ["Pending", "Paid", "Delivering", "Delivered", "Canceled", "Preparing", "Cooked", "Approved"];
  for (const status of statuses) {
    await OrderStatus.findOrCreate({
      where: { status: status },
      defaults: { status: status },
    });
  }
})();

module.exports = OrderStatus;

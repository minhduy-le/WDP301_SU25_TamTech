const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PaymentMethod = sequelize.define(
  "PaymentMethod",
  {
    paymentMethodId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.ENUM("Vnpay", "Momo", "Zalopay"),
      allowNull: false,
    },
  },
  {
    tableName: "payment_methods",
    timestamps: false,
  }
);

// Pre-populate the PaymentMethod table with the allowed values
(async () => {
  await PaymentMethod.sync({ force: false });
  const methods = ["Vnpay", "Momo", "Zalopay"];
  for (const method of methods) {
    await PaymentMethod.findOrCreate({
      where: { name: method },
      defaults: { name: method },
    });
  }
})();

module.exports = PaymentMethod;

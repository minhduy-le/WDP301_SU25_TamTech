const User = require("../models/user");
const Order = require("../models/order");
const httpErrors = require("http-errors");

const getShippers = async () => {
  const shippers = await User.findAll({
    where: { role: "Shipper" },
    attributes: ["id", "fullName", "email", "phone_number"],
  });
  return shippers;
};

module.exports = {
  getShippers,
};

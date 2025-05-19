const sequelize = require("../config/database");
const { Op } = require("sequelize"); // Import Op object
const Product = require("../models/product");
const User = require("../models/user");

const getProductStats = async () => {
  const [results] = await sequelize.query(
    `SELECT 
      SUM(CASE WHEN isActive = true THEN 1 ELSE 0 END) as activeProducts,
      SUM(CASE WHEN isActive = false THEN 1 ELSE 0 END) as inactiveProducts
    FROM products`
  );

  return {
    activeProducts: parseInt(results[0].activeProducts) || 0,
    inactiveProducts: parseInt(results[0].inactiveProducts) || 0,
  };
};

const getUserStats = async () => {
  // Count active users (isActive: true AND isBan: false) by role
  const activeUsers = await User.findAll({
    where: {
      isActive: true,
      isBan: false,
    },
    attributes: ["role", [sequelize.fn("COUNT", sequelize.col("role")), "count"]],
    group: ["role"],
  });

  // Count inactive users (isActive: false OR isBan: true) by role
  const inactiveUsers = await User.findAll({
    where: {
      [Op.or]: [{ isActive: false }, { isBan: true }],
    },
    attributes: ["role", [sequelize.fn("COUNT", sequelize.col("role")), "count"]],
    group: ["role"],
  });

  const stats = {
    Admin: { active: 0, inactive: 0 },
    User: { active: 0, inactive: 0 },
    Staff: { active: 0, inactive: 0 },
    Shipper: { active: 0, inactive: 0 },
  };

  // Populate active user counts
  activeUsers.forEach((user) => {
    stats[user.role].active = parseInt(user.get("count")) || 0;
  });

  // Populate inactive user counts
  inactiveUsers.forEach((user) => {
    stats[user.role].inactive = parseInt(user.get("count")) || 0;
  });

  return stats;
};

module.exports = { getProductStats, getUserStats };

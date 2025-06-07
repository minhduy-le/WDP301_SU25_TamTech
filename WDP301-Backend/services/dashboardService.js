const sequelize = require("../config/database");
const { Op } = require("sequelize"); // Import Op object
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");

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

const getRevenueStats = async (year) => {
  const parsedYear = parseInt(year, 10);
  const currentYear = new Date().getFullYear(); // 2025 as of June 04, 2025

  if (isNaN(parsedYear) || parsedYear < 2001 || parsedYear > currentYear) {
    throw new Error("Year must be between 2001 and " + currentYear);
  }

  const revenueData = await Order.findAll({
    where: {
      status_id: { [Op.ne]: 1 }, // Exclude status_id 1 (Pending)
      [Op.and]: [sequelize.where(sequelize.fn("EXTRACT", sequelize.literal("YEAR FROM order_create_at")), parsedYear)],
    },
    attributes: [
      [sequelize.fn("EXTRACT", sequelize.literal("MONTH FROM order_create_at")), "month"],
      [sequelize.fn("SUM", sequelize.col("order_amount")), "revenue"],
    ],
    group: [sequelize.fn("EXTRACT", sequelize.literal("MONTH FROM order_create_at"))],
    raw: true,
  });

  // Initialize array for all 12 months with revenue 0
  const monthlyRevenue = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    revenue: 0,
  }));

  // Populate revenue data
  revenueData.forEach((data) => {
    const monthIndex = parseInt(data.month) - 1;
    monthlyRevenue[monthIndex].revenue = parseFloat(data.revenue) || 0;
  });

  return monthlyRevenue;
};

const getTopProducts = async () => {
  const topProducts = await OrderItem.findAll({
    attributes: [
      [sequelize.col("Product.name"), "productName"],
      [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"],
      [sequelize.fn("SUM", sequelize.literal("`OrderItem`.`quantity` * `OrderItem`.`price`")), "totalRevenue"],
    ],
    include: [
      {
        model: Product,
        as: "Product",
        attributes: [],
      },
      {
        model: Order,
        as: "Order",
        attributes: [],
        where: {
          status_id: { [Op.notIn]: [1, 5] }, // Exclude Pending (1) and Canceled (5)
        },
      },
    ],
    group: ["Product.productId", "Product.name"],
    order: [[sequelize.fn("SUM", sequelize.col("quantity")), "DESC"]],
    limit: 6,
    raw: true,
  });

  return topProducts.map((item) => ({
    productName: item.productName,
    totalQuantity: parseInt(item.totalQuantity) || 0,
    totalRevenue: parseFloat(item.totalRevenue) || 0,
  }));
};

module.exports = { getProductStats, getUserStats, getRevenueStats, getTopProducts };

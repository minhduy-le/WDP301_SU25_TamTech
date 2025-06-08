const sequelize = require("../config/database");
const { Op } = require("sequelize");
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
  const activeUsers = await User.findAll({
    where: {
      isActive: true,
      isBan: false,
    },
    attributes: ["role", [sequelize.fn("COUNT", sequelize.col("role")), "count"]],
    group: ["role"],
  });

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

  activeUsers.forEach((user) => {
    stats[user.role].active = parseInt(user.get("count")) || 0;
  });

  inactiveUsers.forEach((user) => {
    stats[user.role].inactive = parseInt(user.get("count")) || 0;
  });

  return stats;
};

const getRevenueStats = async (year) => {
  const parsedYear = parseInt(year, 10);
  const currentYear = new Date().getFullYear();

  if (isNaN(parsedYear) || parsedYear < 2001 || parsedYear > currentYear) {
    throw new Error("Year must be between 2001 and " + currentYear);
  }

  const revenueData = await Order.findAll({
    where: {
      status_id: { [Op.ne]: 1 },
      [Op.and]: [sequelize.where(sequelize.fn("EXTRACT", sequelize.literal("YEAR FROM order_create_at")), parsedYear)],
    },
    attributes: [
      [sequelize.fn("EXTRACT", sequelize.literal("MONTH FROM order_create_at")), "month"],
      [sequelize.fn("SUM", sequelize.col("order_amount")), "revenue"],
    ],
    group: [sequelize.fn("EXTRACT", sequelize.literal("MONTH FROM order_create_at"))],
    raw: true,
  });

  const monthlyRevenue = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    revenue: 0,
  }));

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
          status_id: { [Op.notIn]: [1, 5] },
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

const getCurrentMonthRevenue = async () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const previousMonthDate = new Date(now);
  previousMonthDate.setMonth(now.getMonth() - 1);
  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = previousMonthDate.getMonth() + 1;

  const currentRevenueData = await Order.findAll({
    where: {
      status_id: { [Op.notIn]: [1, 5] },
      [Op.and]: [
        sequelize.where(sequelize.fn("EXTRACT", sequelize.literal("YEAR FROM order_create_at")), currentYear),
        sequelize.where(sequelize.fn("EXTRACT", sequelize.literal("MONTH FROM order_create_at")), currentMonth),
      ],
    },
    attributes: [
      [sequelize.fn("SUM", sequelize.col("order_amount")), "revenue"],
      [sequelize.fn("COUNT", sequelize.col("orderId")), "orderCount"],
    ],
    raw: true,
  });

  const previousRevenueData = await Order.findAll({
    where: {
      status_id: { [Op.notIn]: [1, 5] },
      [Op.and]: [
        sequelize.where(sequelize.fn("EXTRACT", sequelize.literal("YEAR FROM order_create_at")), previousYear),
        sequelize.where(sequelize.fn("EXTRACT", sequelize.literal("MONTH FROM order_create_at")), previousMonth),
      ],
    },
    attributes: [[sequelize.fn("SUM", sequelize.col("order_amount")), "revenue"]],
    raw: true,
  });

  const currentRevenue = parseFloat(currentRevenueData[0]?.revenue) || 0;
  const previousRevenue = parseFloat(previousRevenueData[0]?.revenue) || 0;
  const orderCount = parseInt(currentRevenueData[0]?.orderCount) || 0;
  const percentageChange =
    previousRevenue === 0
      ? currentRevenue === 0
        ? 0
        : 100
      : ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  const averageOrderValue = orderCount === 0 ? 0 : currentRevenue / orderCount;

  return {
    currentRevenue,
    percentageChange: parseFloat(percentageChange.toFixed(2)),
    averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
  };
};

const getCurrentMonthOrders = async () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const previousMonthDate = new Date(now);
  previousMonthDate.setMonth(now.getMonth() - 1);
  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = previousMonthDate.getMonth() + 1;

  const currentOrdersData = await Order.findAll({
    where: {
      status_id: { [Op.notIn]: [1, 5] },
      [Op.and]: [
        sequelize.where(sequelize.fn("EXTRACT", sequelize.literal("YEAR FROM order_create_at")), currentYear),
        sequelize.where(sequelize.fn("EXTRACT", sequelize.literal("MONTH FROM order_create_at")), currentMonth),
      ],
    },
    attributes: [[sequelize.fn("COUNT", sequelize.col("orderId")), "orderCount"]],
    raw: true,
  });

  const previousOrdersData = await Order.findAll({
    where: {
      status_id: { [Op.notIn]: [1, 5] },
      [Op.and]: [
        sequelize.where(sequelize.fn("EXTRACT", sequelize.literal("YEAR FROM order_create_at")), previousYear),
        sequelize.where(sequelize.fn("EXTRACT", sequelize.literal("MONTH FROM order_create_at")), previousMonth),
      ],
    },
    attributes: [[sequelize.fn("COUNT", sequelize.col("orderId")), "orderCount"]],
    raw: true,
  });

  const currentOrders = parseInt(currentOrdersData[0]?.orderCount) || 0;
  const previousOrders = parseInt(previousOrdersData[0]?.orderCount) || 0;
  const percentageChange =
    previousOrders === 0 ? (currentOrders === 0 ? 0 : 100) : ((currentOrders - previousOrders) / previousOrders) * 100;

  return {
    currentOrders,
    percentageChange: parseFloat(percentageChange.toFixed(2)),
  };
};

const getCurrentMonthProducts = async () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const previousMonthDate = new Date(now);
  previousMonthDate.setMonth(now.getMonth() - 1);
  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = previousMonthDate.getMonth() + 1;

  // Use raw SQL query to avoid GROUP BY issues
  const [currentProductsData] = await sequelize.query(
    `SELECT SUM(oi.quantity) as totalQuantity
     FROM order_items oi
     JOIN orders o ON oi.orderId = o.orderId
     WHERE o.status_id NOT IN (1, 5)
     AND EXTRACT(YEAR FROM o.order_create_at) = :year
     AND EXTRACT(MONTH FROM o.order_create_at) = :month`,
    {
      replacements: { year: currentYear, month: currentMonth },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  const [previousProductsData] = await sequelize.query(
    `SELECT SUM(oi.quantity) as totalQuantity
     FROM order_items oi
     JOIN orders o ON oi.orderId = o.orderId
     WHERE o.status_id NOT IN (1, 5)
     AND EXTRACT(YEAR FROM o.order_create_at) = :year
     AND EXTRACT(MONTH FROM o.order_create_at) = :month`,
    {
      replacements: { year: previousYear, month: previousMonth },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  const currentQuantity = parseInt(currentProductsData?.totalQuantity) || 0;
  const previousQuantity = parseInt(previousProductsData?.totalQuantity) || 0;
  const percentageChange =
    previousQuantity === 0
      ? currentQuantity === 0
        ? 0
        : 100
      : ((currentQuantity - previousQuantity) / previousQuantity) * 100;

  return {
    currentQuantity,
    percentageChange: parseFloat(percentageChange.toFixed(2)),
  };
};

module.exports = {
  getProductStats,
  getUserStats,
  getRevenueStats,
  getTopProducts,
  getCurrentMonthRevenue,
  getCurrentMonthOrders,
  getCurrentMonthProducts,
};

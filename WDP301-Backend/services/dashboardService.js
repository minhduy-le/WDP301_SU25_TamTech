const sequelize = require("../config/database");
const { Op } = require("sequelize");
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const ProductType = require("../models/productType");

const getProductStats = async () => {
  const [results] = await sequelize.query(
    `WITH ProductStock AS (
      SELECT 
        p.productId,
        p.isActive,
        MIN((m.quantity / NULLIF(pr.quantity, 0)) * pr.quantity) as availableStock
      FROM products p
      LEFT JOIN product_recipes pr ON p.productId = pr.productId
      LEFT JOIN materials m ON pr.materialId = m.materialId
      GROUP BY p.productId, p.isActive
    )
    SELECT 
      SUM(CASE WHEN isActive = true THEN 1 ELSE 0 END) as activeProducts,
      SUM(CASE WHEN isActive = false THEN 1 ELSE 0 END) as inactiveProducts,
      SUM(CASE WHEN availableStock < 10 AND availableStock IS NOT NULL THEN 1 ELSE 0 END) as productsUnder10,
      SUM(CASE WHEN availableStock <= 0 OR availableStock IS NULL THEN 1 ELSE 0 END) as productsOutOfStock
    FROM ProductStock`
  );

  return {
    activeProducts: parseInt(results[0].activeProducts) || 0,
    inactiveProducts: parseInt(results[0].inactiveProducts) || 0,
    productsUnder10: parseInt(results[0].productsUnder10) || 0,
    productsOutOfStock: parseInt(results[0].productsOutOfStock) || 0,
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

  // Get order status IDs for Pending (1), Canceled (5), and Failed (9)
  const excludedStatusIds = [1, 5, 9]; // From orderStatus.js: Pending=1, Canceled=5, Failed=9

  const revenueData = await Order.findAll({
    where: {
      status_id: { [Op.notIn]: excludedStatusIds },
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

const getTopProducts = async (startDate, endDate) => {
  const moment = require("moment");

  // Validate date format and range
  if (!startDate || !endDate) {
    throw new Error("Both startDate and endDate are required");
  }

  const parsedStartDate = moment(startDate, "MM-DD-YYYY", true);
  const parsedEndDate = moment(endDate, "MM-DD-YYYY", true);

  if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
    throw new Error("Invalid date format. Use MM-dd-YYYY");
  }

  if (parsedStartDate.isAfter(parsedEndDate)) {
    throw new Error("startDate must be before or equal to endDate");
  }

  // Calculate duration in days (inclusive of endDate)
  const durationDays = parsedEndDate.diff(parsedStartDate, "days") + 1;

  // Get order status IDs for Pending (1), Canceled (5), and Failed (9)
  const excludedStatusIds = [1, 5, 9]; // From orderStatus.js: Pending=1, Canceled=5, Failed=9

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
          status_id: { [Op.notIn]: excludedStatusIds },
          order_create_at: {
            [Op.between]: [parsedStartDate.startOf("day").toDate(), parsedEndDate.endOf("day").toDate()],
          },
        },
      },
    ],
    group: ["Product.productId", "Product.name"],
    order: [[sequelize.fn("SUM", sequelize.col("quantity")), "DESC"]],
    limit: 6,
    raw: true,
  });

  const stats = topProducts.map((item) => ({
    productName: item.productName,
    totalQuantity: parseInt(item.totalQuantity) || 0,
    totalRevenue: parseFloat(item.totalRevenue) || 0,
  }));

  return { stats, durationDays };
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
      status_id: { [Op.notIn]: [1, 5, 9] },
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

const getMonthlyRevenue = async () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const previousMonthDate = new Date(now);
  previousMonthDate.setMonth(now.getMonth() - 1);
  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = previousMonthDate.getMonth() + 1;

  const currentRevenueData = await sequelize.query(
    `SELECT 
      EXTRACT(WEEK FROM order_create_at) as week,
      SUM(order_amount) as revenue
     FROM orders
     WHERE status_id NOT IN (1, 5)
     AND EXTRACT(YEAR FROM order_create_at) = :currentYear
     AND EXTRACT(MONTH FROM order_create_at) = :currentMonth
     GROUP BY EXTRACT(WEEK FROM order_create_at)`,
    {
      replacements: { currentYear, currentMonth },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  const previousRevenueData = await sequelize.query(
    `SELECT 
      EXTRACT(WEEK FROM order_create_at) as week,
      SUM(order_amount) as revenue
     FROM orders
     WHERE status_id NOT IN (1, 5)
     AND EXTRACT(YEAR FROM order_create_at) = :previousYear
     AND EXTRACT(MONTH FROM order_create_at) = :previousMonth
     GROUP BY EXTRACT(WEEK FROM order_create_at)`,
    {
      replacements: { previousYear, previousMonth },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  // Initialize stats array for 5 weeks
  const stats = Array.from({ length: 5 }, (_, index) => ({
    week: index + 1,
    currentMonthRevenue: 0,
    previousMonthRevenue: 0,
  }));

  // Map current month data
  const currentDataArray = Array.isArray(currentRevenueData) ? currentRevenueData : [];
  currentDataArray.forEach((data) => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const weekNumber = Math.ceil(
      (new Date(currentYear, currentMonth - 1, data.week * 7).getDate() - firstDayOfMonth.getDate() + 1) / 7
    );
    if (weekNumber <= 5 && weekNumber > 0) {
      stats[weekNumber - 1].currentMonthRevenue = parseFloat(data.revenue) || 0;
    }
  });

  // Map previous month data
  const previousDataArray = Array.isArray(previousRevenueData) ? previousRevenueData : [];
  previousDataArray.forEach((data) => {
    const firstDayOfMonth = new Date(previousYear, previousMonth - 1, 1);
    const weekNumber = Math.ceil(
      (new Date(previousYear, previousMonth - 1, data.week * 7).getDate() - firstDayOfMonth.getDate() + 1) / 7
    );
    if (weekNumber <= 5 && weekNumber > 0) {
      stats[weekNumber - 1].previousMonthRevenue = parseFloat(data.revenue) || 0;
    }
  });

  return stats;
};

const getProductTypeSales = async () => {
  // Fetch all product types
  const allProductTypes = await ProductType.findAll({
    attributes: ["name"],
    raw: true,
  });

  // Fetch sales data with LEFT JOIN to include product types with no sales
  const productTypeSales = await sequelize.query(
    `SELECT 
      pt.name as productType,
      COALESCE(SUM(oi.quantity), 0) as totalQuantity
     FROM product_types pt
     LEFT JOIN products p ON pt.productTypeId = p.productTypeId
     LEFT JOIN order_items oi ON p.productId = oi.productId
     LEFT JOIN orders o ON oi.orderId = o.orderId
     WHERE o.orderId IS NULL OR o.status_id NOT IN (1, 5)
     GROUP BY pt.productTypeId, pt.name
     ORDER BY totalQuantity DESC`,
    {
      type: sequelize.QueryTypes.SELECT,
    }
  );

  // Map results to ensure all product types are included
  const stats = allProductTypes.map((pt) => {
    const sale = productTypeSales.find((sale) => sale.productType === pt.name) || {
      productType: pt.name,
      totalQuantity: 0,
    };
    return {
      productType: pt.name,
      totalQuantity: parseInt(sale.totalQuantity) || 0,
    };
  });

  return stats;
};

const getStaffProductivity = async () => {
  const staffUsers = await User.findAll({
    where: { role: "Staff" },
    attributes: ["id", "fullName"],
    raw: true,
  });

  const staffRevenue = await sequelize.query(
    `SELECT 
      u.id,
      u.fullName,
      COALESCE(SUM(o.order_amount), 0) as totalRevenue
     FROM users u
     LEFT JOIN orders o ON (u.id = o.createByStaffId OR u.id = o.approvedBy)
     WHERE u.role = 'Staff'
     AND (o.orderId IS NULL OR o.status_id NOT IN (1, 5))
     GROUP BY u.id, u.fullName
     ORDER BY totalRevenue DESC`,
    {
      type: sequelize.QueryTypes.SELECT,
    }
  );

  const stats = staffUsers.map((staff) => {
    const revenue = staffRevenue.find((rev) => rev.id === staff.id) || {
      fullName: staff.fullName,
      totalRevenue: 0,
    };
    return {
      fullName: staff.fullName,
      totalRevenue: parseFloat(revenue.totalRevenue) || 0,
    };
  });

  return stats;
};

module.exports = {
  getProductStats,
  getUserStats,
  getRevenueStats,
  getTopProducts,
  getCurrentMonthRevenue,
  getCurrentMonthOrders,
  getCurrentMonthProducts,
  getMonthlyRevenue,
  getProductTypeSales,
  getStaffProductivity,
};

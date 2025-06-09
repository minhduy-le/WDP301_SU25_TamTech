const express = require("express");
const router = express.Router();
const dashboardService = require("../services/dashboardService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/dashboard/product-stats:
 *   get:
 *     summary: Get statistics of active and inactive products
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     activeProducts:
 *                       type: integer
 *                     inactiveProducts:
 *                       type: integer
 *                     productsUnder10:
 *                       type: integer
 *                     productsOutOfStock:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/product-stats", verifyToken, async (req, res, next) => {
  try {
    const stats = await dashboardService.getProductStats();
    res.status(200).json({
      status: 200,
      message: "Product statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("Error retrieving product stats:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/dashboard/user-stats:
 *   get:
 *     summary: Get statistics of active and inactive users by role
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     Admin:
 *                       type: object
 *                       properties:
 *                         active:
 *                           type: integer
 *                         inactive:
 *                           type: integer
 *                     User:
 *                       type: object
 *                       properties:
 *                         active:
 *                           type: integer
 *                         inactive:
 *                           type: integer
 *                     Staff:
 *                       type: object
 *                       properties:
 *                         active:
 *                           type: integer
 *                         inactive:
 *                           type: integer
 *                     Shipper:
 *                       type: object
 *                       properties:
 *                         active:
 *                           type: integer
 *                         inactive:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/user-stats", verifyToken, async (req, res, next) => {
  try {
    const stats = await dashboardService.getUserStats();
    res.status(200).json({
      status: 200,
      message: "User statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("Error retrieving user stats:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/dashboard/revenue-stats/{year}:
 *   get:
 *     summary: Get monthly revenue statistics for a given year
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: The year for which to retrieve revenue statistics (e.g., 2025)
 *     responses:
 *       200:
 *         description: Revenue statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: integer
 *                         description: Month number (1-12)
 *                       revenue:
 *                         type: number
 *                         description: Total revenue for the month
 *       400:
 *         description: Invalid year format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Year must be between 2001 and 2025
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: integer
 *       500:
 *         description: Server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Failed to retrieve revenue statistics
 */
router.get("/revenue-stats/:year", verifyToken, async (req, res, next) => {
  try {
    const year = req.params.year;
    const stats = await dashboardService.getRevenueStats(year);
    res.status(200).json({
      status: 200,
      message: "Revenue statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("Error retrieving revenue stats:", error);
    res.status(500).send(error.message || "Failed to retrieve revenue statistics");
  }
});

/**
 * @swagger
 * /api/dashboard/top-products:
 *   get:
 *     summary: Get top 6 best-selling products
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productName:
 *                         type: string
 *                         description: Name of the product
 *                       totalQuantity:
 *                         type: integer
 *                         description: Total quantity sold
 *                       totalRevenue:
 *                         type: number
 *                         description: Total revenue from the product
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: integer
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 */
router.get("/top-products", verifyToken, async (req, res, next) => {
  try {
    const stats = await dashboardService.getTopProducts();
    res.status(200).json({
      status: 200,
      message: "Top products retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("Error retrieving top products:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Failed to retrieve top products",
    });
  }
});

/**
 * @swagger
 * /api/dashboard/current-month-revenue:
 *   get:
 *     summary: Get current month's revenue, percentage change from previous month, and average order value
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current month revenue statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     currentRevenue:
 *                       type: number
 *                       description: Total revenue for current month
 *                     percentageChange:
 *                       type: number
 *                       description: Percentage change compared to previous month
 *                     averageOrderValue:
 *                       type: number
 *                       description: Average value per order
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/current-month-revenue", verifyToken, async (req, res, next) => {
  try {
    const stats = await dashboardService.getCurrentMonthRevenue();
    res.status(200).json({
      status: 200,
      message: "Current month revenue statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("Error retrieving current month revenue:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/dashboard/current-month-orders:
 *   get:
 *     summary: Get current month's order count and percentage change from previous month
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current month order statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     currentOrders:
 *                       type: integer
 *                       description: Total number of orders for current month
 *                     percentageChange:
 *                       type: number
 *                       description: Percentage change compared to previous month
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/current-month-orders", verifyToken, async (req, res, next) => {
  try {
    const stats = await dashboardService.getCurrentMonthOrders();
    res.status(200).json({
      status: 200,
      message: "Current month order statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("Error retrieving current month orders:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/dashboard/current-month-products:
 *   get:
 *     summary: Get current month's sold product quantity and percentage change from previous month
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current month product statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     currentQuantity:
 *                       type: integer
 *                       description: Total quantity of products sold in current month
 *                     percentageChange:
 *                       type: number
 *                       description: Percentage change compared to previous month
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/current-month-products", verifyToken, async (req, res, next) => {
  try {
    const stats = await dashboardService.getCurrentMonthProducts();
    res.status(200).json({
      status: 200,
      message: "Current month product statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("Error retrieving current month products:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/dashboard/monthly-revenue:
 *   get:
 *     summary: Get weekly revenue for current and previous month
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly revenue statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       week:
 *                         type: integer
 *                         description: Week number (1-5)
 *                       currentMonthRevenue:
 *                         type: number
 *                         description: Revenue for the week in the current month
 *                       previousMonthRevenue:
 *                         type: number
 *                         description: Revenue for the week in the previous month
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/monthly-revenue", verifyToken, async (req, res, next) => {
  try {
    const stats = await dashboardService.getMonthlyRevenue();
    res.status(200).json({
      status: 200,
      message: "Weekly revenue statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    console.error("Error retrieving monthly revenue:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

module.exports = router;

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

module.exports = router;

// routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const profileService = require("../services/profileService");
const verifyToken = require("../middlewares/verifyToken");

// API xem profile theo ID
/**
 * @swagger
 * /api/profiles/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     role:
 *                       type: string
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                     member_point:
 *                       type: integer
 *       400:
 *         description: Invalid user ID
 *       403:
 *         description: Unauthorized to view this profile
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId) || userId < 1) {
      return res.status(400).json({
        status: 400,
        message: "Invalid user ID",
      });
    }

    // Kiểm tra quyền truy cập: Chỉ cho phép xem profile của chính mình
    if (userId !== req.userId) {
      return res.status(403).json({
        status: 403,
        message: "You can only view your own profile",
      });
    }

    const user = await profileService.getUserProfile(userId);

    res.status(200).json({
      status: 200,
      message: "User profile retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    if (error.message === "User not found") {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

module.exports = router;

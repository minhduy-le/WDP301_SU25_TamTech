// routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const profileService = require("../services/profileService");
const verifyToken = require("../middlewares/verifyToken");
const QRCode = require("qrcode");

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
 *                 qrCode:
 *                   type: string
 *                   description: Base64 encoded QR code image pointing to the user profile URL
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId) || userId < 1) {
      return res.status(400).json({
        status: 400,
        message: "Invalid user ID",
      });
    }

    const user = await profileService.getUserProfile(userId);

    // Tạo URL cho profile với domain của bạn
    const profileUrl = `https://wdp301-su25.space/public-profiles/${userId}`;

    // Tạo QR code dưới dạng base64
    const qrCode = await QRCode.toDataURL(profileUrl, {
      width: 200, // Kích thước QR code
      color: { dark: "#000000", light: "#ffffff" }, // Màu QR code
    });

    res.status(200).json({
      status: 200,
      message: "User profile retrieved successfully",
      user,
      qrCode, // Trả về QR code trong response
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

router.get("/public/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId) || userId < 1) {
      return res.status(400).send(`
        <html>
          <body>
            <h1>Error</h1>
            <p>Invalid user ID</p>
          </body>
        </html>
      `);
    }

    const user = await profileService.getUserProfile(userId);

    // Trả về trang HTML hiển thị thông tin user
    res.status(200).send(`
      <html>
        <head>
          <title>User Profile</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; }
            h1 { color: #333; }
            p { font-size: 16px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>User Profile</h1>
          <p><strong>Full Name:</strong> ${user.fullName}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Phone Number:</strong> ${user.phone_number || "N/A"}</p>
          <p><strong>Date of Birth:</strong> ${user.date_of_birth || "N/A"}</p>
          <p><strong>Member Points:</strong> ${user.member_point}</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error retrieving public profile:", error);
    if (error.message === "User not found") {
      return res.status(404).send(`
        <html>
          <body>
            <h1>Error</h1>
            <p>User not found</p>
          </body>
        </html>
      `);
    }
    res.status(500).send(`
      <html>
        <body>
          <h1>Error</h1>
          <p>Internal Server Error</p>
        </body>
      </html>
    `);
  }
});

// API cập nhật profile
/**
 * @swagger
 * /api/profiles/{id}:
 *   put:
 *     summary: Update user profile by ID
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 example: jane.doe@example.com
 *               phone_number:
 *                 type: string
 *                 example: 0987654321
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: 1991-02-02
 *     responses:
 *       200:
 *         description: User profile updated successfully
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
 *         description: Invalid input
 *       403:
 *         description: Unauthorized to update this profile
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId) || userId < 1) {
      return res.status(400).json({
        status: 400,
        message: "Invalid user ID",
      });
    }

    // Kiểm tra quyền truy cập: Chỉ cho phép cập nhật profile của chính mình
    if (userId !== req.userId) {
      return res.status(403).json({
        status: 403,
        message: "You can only update your own profile",
      });
    }

    const { fullName, email, phone_number, date_of_birth } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (fullName && (typeof fullName !== "string" || fullName.length > 20)) {
      return res.status(400).json({
        status: 400,
        message: "Full name must be a string with max length of 20 characters",
      });
    }
    if (email && (typeof email !== "string" || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return res.status(400).json({
        status: 400,
        message: "Invalid email format",
      });
    }
    if (phone_number && (typeof phone_number !== "string" || phone_number.length > 12)) {
      return res.status(400).json({
        status: 400,
        message: "Phone number must be a string with max length of 12 characters",
      });
    }
    if (date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth)) {
      return res.status(400).json({
        status: 400,
        message: "Date of birth must be in YYYY-MM-DD format",
      });
    }

    const updatedUser = await profileService.updateUserProfile(userId, {
      fullName,
      email,
      phone_number,
      date_of_birth,
    });

    res.status(200).json({
      status: 200,
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
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

const express = require("express");
const router = express.Router();
const axios = require("axios");
const BankUserInformation = require("../models/bankUser");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/banks:
 *   get:
 *     summary: Retrieve a list of banks from VietQR API
 *     tags: [Banks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of banks with id, name, and code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 desc:
 *                   type: string
 *                   example: "Get Bank list successful! Total 63 banks"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 17
 *                       name:
 *                         type: string
 *                         example: "Ngân hàng TMCP Công thương Việt Nam"
 *                       code:
 *                         type: string
 *                         example: "ICB"
 *       500:
 *         description: Internal server error
 */
router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://api.vietqr.io/v2/banks");
    const filteredData = response.data.data.map((bank) => ({
      id: bank.id,
      name: bank.name,
      code: bank.code,
    }));
    res.json({
      code: response.data.code,
      desc: response.data.desc,
      data: filteredData,
    });
  } catch (error) {
    console.error("Error fetching banks:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/banks/user-information:
 *   post:
 *     summary: Lưu thông tin tài khoản ngân hàng của người dùng
 *     tags: [Banks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bankName
 *               - bankNumber
 *             properties:
 *               bankName:
 *                 type: string
 *                 description: 'Tên ngân hàng (ví dụ: "Ngân hàng TMCP Công thương Việt Nam").'
 *                 example: "Ngân hàng TMCP Kỹ thương Việt Nam"
 *               bankNumber:
 *                 type: string
 *                 description: 'Số tài khoản ngân hàng.'
 *                 example: "1903xxxxxxxx"
 *     responses:
 *       201:
 *         description: Thông tin ngân hàng đã được lưu thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bank information saved successfully."
 *                 bankInfo:
 *                   $ref: '#/components/schemas/BankUserInformation'
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.post("/user-information", verifyToken, async (req, res) => {
  try {
    const { bankName, bankNumber } = req.body;
    const userId = req.userId;

    if (!bankName || !bankNumber) {
      return res.status(400).json({ message: "Bank name and bank number are required." });
    }

    // Sử dụng findOrCreate để tránh tạo bản ghi trùng lặp
    const [bankInfo, created] = await BankUserInformation.findOrCreate({
      where: { userId: userId, bankNumber: bankNumber },
      defaults: {
        userId: userId,
        bankName: bankName,
        bankNumber: bankNumber,
      },
    });

    if (created) {
      res.status(201).json({ message: "Bank information saved successfully.", bankInfo });
    } else {
      res.status(200).json({ message: "Bank information already exists.", bankInfo });
    }
  } catch (error) {
    console.error("Error saving bank information:", error);
    res.status(500).json({ message: "Failed to save bank information.", error: error.message });
  }
});
module.exports = router;

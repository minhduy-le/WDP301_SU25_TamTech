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
 *     summary: Lưu thông tin tài khoản ngân hàng cho một userId cụ thể
 *     tags: [Banks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - bankName
 *               - bankNumber
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID của người dùng cần lưu thông tin.
 *                 example: 12
 *               bankName:
 *                 type: string
 *                 description: Tên ngân hàng.
 *                 example: Ngân hàng TMCP Kỹ thương Việt Nam
 *               bankNumber:
 *                 type: string
 *                 description: Số tài khoản ngân hàng.
 *                 example: "190312345678"
 *     responses:
 *       201:
 *         description: Thông tin ngân hàng đã được lưu thành công.
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ.
 *       500:
 *         description: Lỗi máy chủ.
 */
router.post("/user-information", async (req, res) => {
  try {
    const { userId, bankName, bankNumber } = req.body;

    if (!userId || !bankName || !bankNumber) {
      return res.status(400).json({ message: "userId, bankName, and bankNumber are required." });
    }

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

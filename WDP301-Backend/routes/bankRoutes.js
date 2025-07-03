const express = require("express");
const router = express.Router();
const axios = require("axios");

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

module.exports = router;

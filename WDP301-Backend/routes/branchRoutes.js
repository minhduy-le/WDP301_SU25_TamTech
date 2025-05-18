/**
 * @swagger
 * tags:
 *   name: Branches
 *   description: Branch management endpoints
 */
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const branchService = require("../services/branchService");

/**
 * @swagger
 * /api/branches:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - provinnce
 *               - district
 *             properties:
 *               name:
 *                 type: string
 *                 description: Branch name
 *               address:
 *                 type: string
 *                 description: Branch address
 *               provinnce:
 *                 type: string
 *                 description: Province of the branch
 *               district:
 *                 type: string
 *                 description: District of the branch
 *     responses:
 *       201:
 *         description: Branch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     branchId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                     provinnce:
 *                       type: string
 *                     district:
 *                       type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const branchData = {
      name: req.body.name,
      address: req.body.address,
      provinnce: req.body.provinnce,
      district: req.body.district,
    };

    const newBranch = await branchService.createBranch(branchData);
    res.status(201).json({
      status: 201,
      message: "Branch created successfully",
      data: newBranch,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});

module.exports = router;

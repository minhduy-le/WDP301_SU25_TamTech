/**
 * @swagger
 * tags:
 *   name: Materials
 *   description: Material management endpoints
 */
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const materialService = require("../services/materialService");

/**
 * @swagger
 * /api/materials:
 *   post:
 *     summary: Create a new material
 *     tags: [Materials]
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
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *                 description: Material name
 *               quantity:
 *                 type: integer
 *                 description: Material quantity
 *     responses:
 *       201:
 *         description: Material created successfully
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
 *                     materialId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     storeId:
 *                       type: integer
 *                       description: Hardcoded to 1
 *                     barcode:
 *                       type: string
 *                       description: URL of the generated barcode image
 *       400:
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Quantity must be greater than 0 and less than 10000
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const materialData = {
      name: req.body.name,
      quantity: parseInt(req.body.quantity),
    };

    console.log("Parsed quantity:", materialData.quantity);
    console.log("Material data:", materialData);

    const newMaterial = await materialService.createMaterial(materialData);
    res.status(201).json({
      status: 201,
      message: "Material created successfully",
      data: newMaterial,
    });
  } catch (error) {
    console.error("Caught error:", error, "Type:", typeof error, "Stack:", error.stack);
    if (typeof error === "string") {
      res.status(400).send(error);
    } else if (error.message && typeof error.message === "string") {
      res.status(400).send(error.message);
    } else {
      res.status(500).send("Internal server error");
    }
  }
});

/**
 * @swagger
 * /api/materials/{materialId}/scan:
 *   put:
 *     summary: Increase material quantity by 100 on barcode scan
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: materialId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Material quantity increased successfully
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
 *                     materialId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *       400:
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Quantity must be greater than 0 and less than 10000
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Material not found
 *       500:
 *         description: Server error
 */
router.put("/:materialId/scan", verifyToken, async (req, res, next) => {
  try {
    const materialId = parseInt(req.params.materialId);
    const updatedMaterial = await materialService.increaseMaterialQuantity(materialId);
    res.status(200).json({
      status: 200,
      message: "Material quantity increased successfully",
      data: updatedMaterial,
    });
  } catch (error) {
    console.error("Caught error:", error, "Type:", typeof error, "Stack:", error.stack);
    if (typeof error === "string") {
      res.status(400).send(error);
    } else if (error.message && typeof error.message === "string") {
      res.status(400).send(error.message);
    } else {
      res.status(500).send("Internal server error");
    }
  }
});

/**
 * @swagger
 * /api/materials:
 *   get:
 *     summary: Get all materials
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of materials with their associated stores
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       materialId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       storeId:
 *                         type: integer
 *                       barcode:
 *                         type: string
 *                         description: URL of the generated barcode image
 *                       Store:
 *                         type: object
 *                         properties:
 *                           storeId:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           address:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res, next) => {
  try {
    const materials = await materialService.getAllMaterials();
    res.status(200).json({
      status: 200,
      message: "Materials retrieved successfully",
      data: materials,
    });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

module.exports = router;

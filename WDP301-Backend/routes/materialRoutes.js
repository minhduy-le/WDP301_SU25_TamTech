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
const restrictToRoles = require("../middlewares/restrictToRoles");

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
 *               expireDate:
 *                 type: string
 *                 format: date-time
 *                 description: Expiry date of the material (optional)
 *               timeExpired:
 *                 type: string
 *                 description: Time of expiry in hh:mm:ss format (e.g., 14:30:00, optional)
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
 *                     expireDate:
 *                       type: string
 *                       format: date-time
 *                       description: Expiry date of the material
 *                     timeExpired:
 *                       type: string
 *                       description: Time of expiry in hh:mm:ss format
 *                     isExpired:
 *                       type: boolean
 *                       description: Whether the material is expired
 *       400:
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: timeExpired must be in hh:mm:ss format (e.g., 14:30:00)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, restrictToRoles("Manager"), async (req, res, next) => {
  try {
    const materialData = {
      name: req.body.name,
      quantity: parseInt(req.body.quantity),
      expireDate: req.body.expireDate,
      timeExpired: req.body.timeExpired,
    };

    console.log("Parsed material data:", materialData);

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
router.put("/:materialId/scan", verifyToken, restrictToRoles("Manager"), async (req, res, next) => {
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
 * /api/materials/{materialId}/process-expired:
 *   put:
 *     summary: Mark material as processed expired
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
 *         description: Material marked as processed expired successfully
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
 *                     isProcessExpired:
 *                       type: boolean
 *       400:
 *         description: Invalid input, material not expired, or already processed
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Material must be expired before marking as processed or Material already marked as processed expired
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Material not found
 *       500:
 *         description: Server error
 */
router.put("/:materialId/process-expired", verifyToken, restrictToRoles("Manager"), async (req, res, next) => {
  try {
    const materialId = parseInt(req.params.materialId);
    const updatedMaterial = await materialService.markAsProcessedExpired(materialId);
    res.status(200).json({
      status: 200,
      message: "Material marked as processed expired successfully",
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
 *                       expireDate:
 *                         type: string
 *                         format: date-time
 *                         description: Expiry date of the material
 *                       timeExpired:
 *                         type: string
 *                         description: Time of expiry in hh:mm:ss format
 *                       isExpired:
 *                         type: boolean
 *                         description: Whether the material is expired
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

/**
 * @swagger
 * /api/materials/{materialId}:
 *   put:
 *     summary: Update material name, quantity, expireDate, and/or timeExpired
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: materialId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Material name (optional)
 *               quantity:
 *                 type: integer
 *                 description: Material quantity (optional)
 *               expireDate:
 *                 type: string
 *                 format: date-time
 *                 description: Expiry date of the material (optional)
 *               timeExpired:
 *                 type: string
 *                 description: Time of expiry in hh:mm:ss format (e.g., 14:30:00, optional)
 *     responses:
 *       200:
 *         description: Material updated successfully
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
 *                     barcode:
 *                       type: string
 *                     expireDate:
 *                       type: string
 *                       format: date-time
 *                       description: Expiry date of the material
 *                     timeExpired:
 *                       type: string
 *                       description: Time of expiry in hh:mm:ss format
 *                     isExpired:
 *                       type: boolean
 *                       description: Whether the material is expired
 *       400:
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: timeExpired must be in hh:mm:ss format (e.g., 14:30:00)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Material not found
 *       500:
 *         description: Server error
 */
router.put("/:materialId", verifyToken, restrictToRoles("Manager"), async (req, res, next) => {
  try {
    const materialId = parseInt(req.params.materialId);
    const materialData = {
      name: req.body.name,
      quantity: req.body.quantity ? parseInt(req.body.quantity) : undefined,
      expireDate: req.body.expireDate,
      timeExpired: req.body.timeExpired,
    };
    console.log("Parsed material data:", materialData);
    const updatedMaterial = await materialService.updateMaterial(materialId, materialData);
    res.status(200).json({
      status: 200,
      message: "Material updated successfully",
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
 * /api/materials/{materialId}:
 *   delete:
 *     summary: Deactivate a material (set isActive to false)
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
 *         description: Material deactivated successfully
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
 *                     isActive:
 *                       type: boolean
 *       400:
 *         description: Invalid input or material referenced by active products
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Cannot delete material as it is referenced by active products
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Material not found
 *       500:
 *         description: Server error
 */
router.delete("/:materialId", verifyToken, restrictToRoles("Manager"), async (req, res, next) => {
  try {
    const materialId = parseInt(req.params.materialId);
    const deletedMaterial = await materialService.deleteMaterial(materialId);
    res.status(200).json({
      status: 200,
      message: "Material deactivated successfully",
      data: deletedMaterial,
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
 * /api/materials/expired:
 *   get:
 *     summary: Get all expired materials
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of expired materials with their associated stores
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
 *                       expireDate:
 *                         type: string
 *                         format: date-time
 *                         description: Expiry date of the material
 *                       timeExpired:
 *                         type: string
 *                         description: Time of expiry in hh:mm:ss format
 *                       isExpired:
 *                         type: boolean
 *                         description: Whether the material is expired
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
router.get("/expired", verifyToken, restrictToRoles("Manager"), async (req, res, next) => {
  try {
    const materials = await materialService.getExpiredMaterials();
    res.status(200).json({
      status: 200,
      message: "Expired materials retrieved successfully",
      data: materials,
    });
  } catch (error) {
    console.error("Caught error:", error, "Type:", typeof error, "Stack:", error.stack);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;

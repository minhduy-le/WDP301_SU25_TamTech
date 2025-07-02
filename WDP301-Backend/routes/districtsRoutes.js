const express = require("express");
const router = express.Router();
const { getAllDistricts, getWardsByDistrict, getUserOrderAddresses } = require("../services/districtsService");
const verifyToken = require("../middlewares/verifyToken");

console.log("Loading districtsRoutes.js version 2025-05-24-ghn-hcmc-wards-api");

// GET /api/location/districts - Get all HCMC districts from GHN API
/**
 * @swagger
 * /api/location/districts:
 *   get:
 *     summary: Retrieve all districts and administrative units in Ho Chi Minh City
 *     description: Fetches a list of districts and administrative units (urban districts, rural districts, and Thu Duc City) in Ho Chi Minh City from the GHN API.
 *     tags: [Location]
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of HCMC districts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: HCMC districts retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Quận 1
 *                       type:
 *                         type: string
 *                         enum: [urban district, rural district, city]
 *                         example: urban district
 *                       districtId:
 *                         type: integer
 *                         example: 1442
 *       500:
 *         description: Failed to retrieve districts due to an internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve HCMC districts
 *                 error:
 *                   type: string
 *                   example: Failed to retrieve HCMC districts from GHN API
 */
router.get("/districts", async (req, res) => {
  try {
    const districts = await getAllDistricts();
    res.status(200).json({
      message: "HCMC districts retrieved successfully",
      data: districts,
    });
  } catch (error) {
    console.error("Error in GET /api/districts:", error.message);
    res.status(500).json({
      message: "Failed to retrieve HCMC districts",
      error: error.message,
    });
  }
});

// GET /api/location/wards - Get wards by district ID from GHN API
/**
 * @swagger
 * /api/location/wards:
 *   get:
 *     summary: Retrieve all wards within a district in Ho Chi Minh City
 *     description: Fetches a list of wards (phường/xã/thị trấn) within a specified district in Ho Chi Minh City from the GHN API. Requires a district_id query parameter, which can be obtained from the /api/districts endpoint.
 *     tags: [Location]
 *     parameters:
 *       - in: query
 *         name: district_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the district to fetch wards for (e.g., 1442 for Quận 1)
 *         example: 1442
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of wards for the specified district
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Wards retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Phường Bến Nghé
 *                       type:
 *                         type: string
 *                         enum: [ward, commune, town]
 *                         example: ward
 *       400:
 *         description: Missing or invalid district_id parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: district_id query parameter is required and must be a number
 *       500:
 *         description: Failed to retrieve wards due to an internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve wards
 *                 error:
 *                   type: string
 *                   example: Failed to retrieve wards for district ID 1442 from GHN API
 */
router.get("/wards", async (req, res) => {
  try {
    const districtId = req.query.district_id;

    if (!districtId || isNaN(districtId)) {
      return res.status(400).json({
        message: "district_id query parameter is required and must be a number",
      });
    }

    const wards = await getWardsByDistrict(districtId);
    res.status(200).json({
      message: "Wards retrieved successfully",
      data: wards,
    });
  } catch (error) {
    console.error("Error in GET /api/wards:", error.message);
    res.status(500).json({
      message: "Failed to retrieve wards",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/location/addresses/user:
 *   get:
 *     summary: Retrieve unique order addresses for the authenticated user
 *     description: Fetches a list of unique addresses from orders placed by the authenticated user.
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved unique order addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unique order addresses retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 123 Đường Láng, Phường Bến Nghé, Quận 1, TP.HCM
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       500:
 *         description: Failed to retrieve addresses due to an internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve user order addresses
 *                 error:
 *                   type: string
 *                   example: Failed to retrieve user order addresses
 */
router.get("/addresses/user", verifyToken, async (req, res) => {
  try {
    const addresses = await getUserOrderAddresses(req.userId);
    res.status(200).json({
      message: "Unique order addresses retrieved successfully",
      data: addresses,
    });
  } catch (error) {
    console.error("Error in GET /api/location/addresses:", error.message);
    res.status(500).json({
      message: "Failed to retrieve user order addresses",
      error: error.message,
    });
  }
});

module.exports = router;

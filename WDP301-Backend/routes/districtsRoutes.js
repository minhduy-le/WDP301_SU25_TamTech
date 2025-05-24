const express = require("express");
const router = express.Router();
const { getAllDistricts } = require("../services/districtsService");

console.log("Loading districtsRoutes.js version 2025-05-24-ghn-hcmc-districts-api");

// GET /api/districts - Get all HCMC districts from GHN API
/**
 * @swagger
 * /api/districts:
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
router.get("/", async (req, res) => {
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

module.exports = router;

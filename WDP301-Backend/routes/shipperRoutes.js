const express = require("express");
const router = express.Router();
const shipperService = require("../services/shipperService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/shippers:
 *   get:
 *     summary: Get list of shippers
 *     description: Retrieve all users with role 'Shipper'
 *     tags: [Shippers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shippers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   fullName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone_number:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const shippers = await shipperService.getShippers();
    res.status(200).json(shippers);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * @swagger
 * /api/shippers/assign/{orderId}:
 *   post:
 *     summary: Assign a shipper to an order
 *     description: Update the assignToShipperId field of an order with the specified shipper ID for a specific date
 *     tags: [Shippers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order to assign a shipper to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipperId
 *               - orderDate
 *             properties:
 *               shipperId:
 *                 type: integer
 *                 description: The ID of the shipper to assign
 *               orderDate:
 *                 type: string
 *                 description: The date of the order in MM-DD-YYYY format
 *     responses:
 *       200:
 *         description: Shipper assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 orderId:
 *                   type: integer
 *                 shipperId:
 *                   type: integer
 *       400:
 *         description: Invalid input, invalid date format, or shipper not scheduled for the specified date
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/assign/:orderId", verifyToken, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { shipperId, orderDate } = req.body;
    const result = await shipperService.assignShipperToOrder(orderId, shipperId, orderDate);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * @swagger
 * /api/schedules/register:
 *   post:
 *     summary: Register a schedule for a shipper
 *     description: Create a schedule for a specific day (MM-DD-YYYY) for a shipper
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dayOfWeek
 *             properties:
 *               dayOfWeek:
 *                 type: string
 *                 description: Date in MM-DD-YYYY format
 *     responses:
 *       201:
 *         description: Schedule registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 scheduleId:
 *                   type: integer
 *                 shipperId:
 *                   type: integer
 *                 dayOfWeek:
 *                   type: string
 *       400:
 *         description: Invalid date format or date is not after today
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User is not a shipper
 *       500:
 *         description: Server error
 */
router.post("/register", verifyToken, async (req, res, next) => {
  try {
    const { dayOfWeek } = req.body;
    const shipperId = req.userId;
    const result = await shipperService.registerSchedule(shipperId, dayOfWeek);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * @swagger
 * /api/shippers/scheduled/currentDate:
 *   get:
 *     summary: Get list of shippers scheduled for today
 *     description: Retrieve all shippers who have registered a schedule for the current date
 *     tags: [Shippers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of scheduled shippers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   fullName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone_number:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/scheduled/currentDate", verifyToken, async (req, res, next) => {
  try {
    const shippers = await shipperService.getShippersByDate();
    res.status(200).json(shippers);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * @swagger
 * /api/schedules/{scheduleId}/start-time:
 *   put:
 *     summary: Update start time for a schedule
 *     description: Update the startTime for a specific schedule to the current time if the user is the assigned shipper and the schedule is not completed
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the schedule to update
 *     responses:
 *       200:
 *         description: Start time updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 scheduleId:
 *                   type: integer
 *                 startTime:
 *                   type: string
 *       400:
 *         description: Schedule already has start and end times
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User is not the assigned shipper
 *       404:
 *         description: Schedule or schedule-shipper association not found
 *       500:
 *         description: Server error
 */
router.put("/:scheduleId/start-time", verifyToken, async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const shipperId = req.userId;
    const result = await shipperService.updateStartTime(shipperId, scheduleId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * @swagger
 * /api/schedules/{scheduleId}/end-time:
 *   put:
 *     summary: Update end time for a schedule
 *     description: Update the endTime for a specific schedule to the current time if the user is the assigned shipper, startTime is set, and the schedule is not completed
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the schedule to update
 *     responses:
 *       200:
 *         description: End time updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 scheduleId:
 *                   type: integer
 *                 endTime:
 *                   type: string
 *       400:
 *         description: Schedule already has start and end times or start time not set
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User is not the assigned shipper
 *       404:
 *         description: Schedule or schedule-shipper association not found
 *       500:
 *         description: Server error
 */
router.put("/:scheduleId/end-time", verifyToken, async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const shipperId = req.userId;
    const result = await shipperService.updateEndTime(shipperId, scheduleId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;

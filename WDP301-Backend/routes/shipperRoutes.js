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
 * /api/shippers/assign:
 *   post:
 *     summary: Assign a shipper to multiple orders
 *     description: Assigns a single shipper to a batch of orders for a specific date. The shipper must be scheduled for that date and have no other ongoing deliveries.
 *     tags: [Shippers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderIds
 *               - shipperId
 *               - orderDate
 *             properties:
 *               orderIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: A list of order IDs to be assigned.
 *                 example: [101, 102, 103]
 *               shipperId:
 *                 type: integer
 *                 description: The ID of the shipper to assign.
 *               orderDate:
 *                 type: string
 *                 description: The date of the orders in MM-DD-YYYY format.
 *     responses:
 *       200:
 *         description: Batch assignment process completed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 shipperId:
 *                   type: integer
 *                 successCount:
 *                   type: integer
 *                 failureCount:
 *                   type: integer
 *                 assignedOrderIds:
 *                   type: array
 *                   items:
 *                     type: integer
 *                 failedAssignments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderId:
 *                         type: integer
 *                       reason:
 *                         type: string
 *       400:
 *         description: Invalid input, shipper not available, or some orders could not be assigned.
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/assign", verifyToken, async (req, res, next) => {
  try {
    const { orderIds, shipperId, orderDate } = req.body;
    const result = await shipperService.assignShipperToOrder(orderIds, shipperId, orderDate);
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
 *     description: Retrieve all shippers who have registered a schedule for the current date, including their active order count.
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
 *                   activeOrderCount:
 *                     type: integer
 *                     description: The number of orders assigned to the shipper that are not yet delivered (status_id != 4).
 *                     example: 2
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

/**
 * @swagger
 * /api/shippers/assigned-orders:
 *   get:
 *     summary: Lấy các đơn hàng được gán cho shipper hiện tại
 *     description: Lấy danh sách tất cả các đơn hàng đã được gán cho shipper đang đăng nhập (dựa trên token).
 *     tags: [Shippers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng được gán thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   orderId:
 *                     type: integer
 *                   assignToShipperId:
 *                     type: integer
 *                   # Thêm các thuộc tính khác của đơn hàng tại đây, ví dụ:
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized (Chưa xác thực).
 *       403:
 *         description: Forbidden (Người dùng không phải là shipper).
 *       500:
 *         description: Lỗi máy chủ.
 */
router.get("/assigned-orders", verifyToken, async (req, res, next) => {
  try {
    const shipperId = req.userId;
    const orders = await shipperService.getAssignedOrders(shipperId);
    res.status(200).json(orders);
  } catch (error) {
    if (error.message === "User is not a shipper") {
      return res.status(403).send(error.message);
    }
    res.status(400).send(error.message);
  }
});

/**
 * @swagger
 * /api/shippers/registered-schedules:
 *   get:
 *     summary: Lấy ngày làm việc đã đăng ký của shipper
 *     description: Lấy danh sách các ngày làm việc đã được đăng ký bởi shipper đang đăng nhập, trả về cả ngày và thời gian check-in/check-out nếu có.
 *     tags: [Shippers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách ngày đăng ký thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   scheduleId:
 *                     type: integer
 *                     example: 12
 *                   dayOfWeek:
 *                     type: string
 *                     example: "Monday"
 *                   startTime:
 *                     type: string
 *                     format: time
 *                     nullable: true
 *                     example: "08:00:00"
 *                   endTime:
 *                     type: string
 *                     format: time
 *                     nullable: true
 *                     example: "17:00:00"
 *       401:
 *         description: Unauthorized (Chưa xác thực).
 *       403:
 *         description: Forbidden (Người dùng không phải là shipper).
 *       400:
 *         description: Lỗi xử lý yêu cầu.
 */
router.get("/registered-schedules", verifyToken, async (req, res, next) => {
  try {
    const shipperId = req.userId;
    const schedules = await shipperService.getRegisteredScheduleDates(shipperId);
    res.status(200).json(schedules);
  } catch (error) {
    if (error.message === "User is not a shipper") {
      return res.status(403).send(error.message);
    }
    res.status(400).send(error.message);
  }
});

module.exports = router;

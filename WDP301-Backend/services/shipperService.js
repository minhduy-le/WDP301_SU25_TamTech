const User = require("../models/user");
const Order = require("../models/order");
const Schedule = require("../models/schedule");
const ScheduleShipper = require("../models/ScheduleShipper");
const httpErrors = require("http-errors");
const { DateTime } = require("luxon");

const getShippers = async () => {
  const shippers = await User.findAll({
    where: { role: "Shipper" },
    attributes: ["id", "fullName", "email", "phone_number"],
  });
  return shippers;
};

const assignShipperToOrder = async (orderId, shipperId, orderDate) => {
  // Validate inputs
  if (!orderId || !shipperId || !orderDate) {
    throw new Error("Order ID, Shipper ID, and Order Date are required");
  }

  // Validate date format
  const date = DateTime.fromFormat(orderDate, "MM-dd-yyyy");
  if (!date.isValid) {
    throw new Error("Invalid date format. Use MM-DD-YYYY");
  }

  // Check if order exists
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  // Check if shipper exists and has role "Shipper"
  const shipper = await User.findByPk(shipperId);
  if (!shipper || shipper.role !== "Shipper") {
    throw new Error("Invalid shipper ID or user is not a shipper");
  }

  // Check if shipper has a schedule for the specified order date
  const schedule = await Schedule.findOne({
    where: { dayOfWeek: date.toFormat("MM-dd-yyyy") },
    include: [
      {
        model: ScheduleShipper,
        as: "ScheduleShippers",
        where: { shipperId },
        required: true,
      },
    ],
  });

  if (!schedule) {
    throw new Error(`Shipper has not registered a schedule for ${orderDate}`);
  }

  // Update order with assignToShipperId
  order.assignToShipperId = shipperId;
  await order.save();

  return {
    message: "Shipper assigned successfully",
    orderId: order.orderId,
    shipperId: shipperId,
  };
};

const registerSchedule = async (shipperId, dayOfWeek) => {
  // Validate user role
  const user = await User.findByPk(shipperId);
  if (!user || user.role !== "Shipper") {
    throw new Error("User is not a shipper");
  }

  // Validate date format and ensure it's after today
  const date = DateTime.fromFormat(dayOfWeek, "MM-dd-yyyy");
  if (!date.isValid) {
    throw new Error("Invalid date format. Use MM-DD-YYYY");
  }
  const today = DateTime.now().startOf("day");
  if (date <= today) {
    throw new Error("Date must be after today");
  }

  // Create schedule
  const schedule = await Schedule.create({ dayOfWeek: date.toFormat("MM-dd-yyyy") });

  // Associate schedule with shipper
  const scheduleShipper = await ScheduleShipper.create({
    scheduleId: schedule.scheduleId,
    shipperId,
  });

  return {
    message: "Schedule registered successfully",
    scheduleId: schedule.scheduleId,
    shipperId,
    dayOfWeek: schedule.dayOfWeek,
  };
};

const updateStartTime = async (shipperId, scheduleId) => {
  // Validate user role
  const user = await User.findByPk(shipperId);
  if (!user || user.role !== "Shipper") {
    throw new Error("User is not a shipper");
  }

  // Check if schedule exists
  const schedule = await Schedule.findByPk(scheduleId);
  if (!schedule) {
    throw new Error("Schedule not found");
  }

  // Check if shipper is assigned to this schedule
  const scheduleShipper = await ScheduleShipper.findOne({
    where: { scheduleId, shipperId },
  });
  if (!scheduleShipper) {
    throw new Error("User is not assigned to this schedule");
  }

  // Check if schedule already has start time or is completed
  if (schedule.startTime) {
    throw new Error("Start time is already set for this schedule");
  }
  if (schedule.endTime) {
    throw new Error("Schedule already has an end time");
  }

  // Set startTime to current time
  const currentTime = DateTime.now().toFormat("HH:mm");
  schedule.startTime = currentTime;
  await schedule.save();

  return {
    message: "Start time updated successfully",
    scheduleId: schedule.scheduleId,
    startTime: schedule.startTime,
  };
};

const updateEndTime = async (shipperId, scheduleId) => {
  // Validate user role
  const user = await User.findByPk(shipperId);
  if (!user || user.role !== "Shipper") {
    throw new Error("User is not a shipper");
  }

  // Check if schedule exists
  const schedule = await Schedule.findByPk(scheduleId);
  if (!schedule) {
    throw new Error("Schedule not found");
  }

  // Check if shipper is assigned to this schedule
  const scheduleShipper = await ScheduleShipper.findOne({
    where: { scheduleId, shipperId },
  });
  if (!scheduleShipper) {
    throw new Error("User is not assigned to this schedule");
  }

  // Check if schedule already has end time or is completed
  if (schedule.endTime) {
    throw new Error("End time is already set for this schedule");
  }
  if (!schedule.startTime) {
    throw new Error("Start time must be set before end time");
  }

  // Set endTime to current time
  const currentTime = DateTime.now().toFormat("HH:mm");
  schedule.endTime = currentTime;
  await schedule.save();

  return {
    message: "End time updated successfully",
    scheduleId: schedule.scheduleId,
    endTime: schedule.endTime,
  };
};

module.exports = {
  getShippers,
  assignShipperToOrder,
  registerSchedule,
  updateStartTime,
  updateEndTime,
};

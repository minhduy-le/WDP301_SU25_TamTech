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
  if (!orderId || !shipperId || !orderDate) {
    throw new Error("Order ID, Shipper ID, and Order Date are required");
  }

  const date = DateTime.fromFormat(orderDate, "MM-dd-yyyy");
  if (!date.isValid) {
    throw new Error("Invalid date format. Use MM-DD-YYYY");
  }

  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  const shipper = await User.findByPk(shipperId);
  if (!shipper || shipper.role !== "Shipper") {
    throw new Error("Invalid shipper ID or user is not a shipper");
  }

  const ongoingOrder = await Order.findOne({
    where: {
      assignToShipperId: shipperId,
      certificationOfDelivered: null,
    },
  });

  if (ongoingOrder) {
    throw new Error("Shipper đang có đơn hàng chưa giao xong và không thể nhận đơn mới.");
  }

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

  order.assignToShipperId = shipperId;
  await order.save();

  return {
    message: "Shipper assigned successfully",
    orderId: order.orderId,
    shipperId: shipperId,
  };
};

const registerSchedule = async (shipperId, dayOfWeek) => {
  const user = await User.findByPk(shipperId);
  if (!user || user.role !== "Shipper") {
    throw new Error("User is not a shipper");
  }

  const date = DateTime.fromFormat(dayOfWeek, "MM-dd-yyyy");
  if (!date.isValid) {
    throw new Error("Invalid date format. Use MM-DD-YYYY");
  }
  const today = DateTime.now().startOf("day");
  if (date <= today) {
    throw new Error("Date must be after today");
  }

  const schedule = await Schedule.create({ dayOfWeek: date.toFormat("MM-dd-yyyy") });

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
  const user = await User.findByPk(shipperId);
  if (!user || user.role !== "Shipper") {
    throw new Error("User is not a shipper");
  }

  const schedule = await Schedule.findByPk(scheduleId);
  if (!schedule) {
    throw new Error("Schedule not found");
  }

  const scheduleShipper = await ScheduleShipper.findOne({
    where: { scheduleId, shipperId },
  });
  if (!scheduleShipper) {
    throw new Error("User is not assigned to this schedule");
  }

  if (schedule.startTime) {
    throw new Error("Start time is already set for this schedule");
  }
  if (schedule.endTime) {
    throw new Error("Schedule already has an end time");
  }

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
  const user = await User.findByPk(shipperId);
  if (!user || user.role !== "Shipper") {
    throw new Error("User is not a shipper");
  }

  const schedule = await Schedule.findByPk(scheduleId);
  if (!schedule) {
    throw new Error("Schedule not found");
  }

  const scheduleShipper = await ScheduleShipper.findOne({
    where: { scheduleId, shipperId },
  });
  if (!scheduleShipper) {
    throw new Error("User is not assigned to this schedule");
  }

  if (schedule.endTime) {
    throw new Error("End time is already set for this schedule");
  }
  if (!schedule.startTime) {
    throw new Error("Start time must be set before end time");
  }

  const currentTime = DateTime.now().toFormat("HH:mm");
  schedule.endTime = currentTime;
  await schedule.save();

  return {
    message: "End time updated successfully",
    scheduleId: schedule.scheduleId,
    endTime: schedule.endTime,
  };
};

const getShippersByDate = async () => {
  const targetDate = DateTime.now().toFormat("MM-dd-yyyy");

  const schedules = await Schedule.findAll({
    where: { dayOfWeek: targetDate },
    include: [
      {
        model: ScheduleShipper,
        as: "ScheduleShippers",
        include: [
          {
            model: User,
            as: "Shipper",
            where: { role: "Shipper" },
            attributes: ["id", "fullName", "email", "phone_number"],
          },
        ],
      },
    ],
  });

  const shippers = schedules
    .flatMap((schedule) => schedule.ScheduleShippers.map((ss) => ss.Shipper))
    .filter((shipper) => shipper !== null);

  return shippers;
};

const getAssignedOrders = async (shipperId) => {
  const shipper = await User.findByPk(shipperId);
  if (!shipper || shipper.role !== "Shipper") {
    throw new Error("User is not a shipper");
  }

  const orders = await Order.findAll({
    where: {
      assignToShipperId: shipperId,
    },
  });

  return orders;
};

module.exports = {
  getShippers,
  assignShipperToOrder,
  registerSchedule,
  updateStartTime,
  updateEndTime,
  getShippersByDate,
  getAssignedOrders,
};

const User = require("../models/user");
const Order = require("../models/order");
const Schedule = require("../models/schedule");
const ScheduleShipper = require("../models/ScheduleShipper");
const httpErrors = require("http-errors");
const { DateTime } = require("luxon");
const { Op } = require("sequelize");

const getShippers = async () => {
  const shippers = await User.findAll({
    where: { role: "Shipper" },
    attributes: ["id", "fullName", "email", "phone_number"],
  });
  return shippers;
};

const assignShipperToOrder = async (orderIds, shipperId, orderDate) => {
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    throw new Error("Yêu cầu phải có một danh sách ID đơn hàng (orderIds).");
  }
  if (!shipperId || !orderDate) {
    throw new Error("Yêu cầu phải có ID của shipper (shipperId) và ngày giao hàng (orderDate).");
  }

  const date = DateTime.fromFormat(orderDate, "MM-dd-yyyy");
  if (!date.isValid) {
    throw new Error("Định dạng ngày không hợp lệ. Vui lòng sử dụng MM-DD-YYYY.");
  }
  const formattedDate = date.toFormat("MM-dd-yyyy");

  const shipper = await User.findByPk(shipperId);
  if (!shipper || shipper.role !== "Shipper") {
    throw new Error("ID shipper không hợp lệ hoặc người dùng không phải là shipper.");
  }

  const schedule = await Schedule.findOne({
    where: { dayOfWeek: formattedDate },
    include: [{ model: ScheduleShipper, as: "ScheduleShippers", where: { shipperId }, required: true }],
  });
  if (!schedule) {
    throw new Error(`Shipper chưa đăng ký lịch làm việc cho ngày ${orderDate}.`);
  }

  const ongoingOrder = await Order.findOne({
    where: {
      assignToShipperId: shipperId,
      certificationOfDelivered: null,
    },
  });
  if (ongoingOrder) {
    throw new Error("Shipper đang có đơn hàng chưa giao xong và không thể nhận thêm đơn mới.");
  }

  const orders = await Order.findAll({ where: { orderId: orderIds } });
  const orderMap = new Map(orders.map((o) => [o.orderId, o]));

  const successfulIds = [];
  const failedAssignments = [];

  for (const orderId of orderIds) {
    const parsedOrderId = parseInt(orderId, 10);
    const order = orderMap.get(parsedOrderId);

    if (!order) {
      failedAssignments.push({ orderId, reason: "Không tìm thấy đơn hàng." });
    } else if (order.assignToShipperId) {
      failedAssignments.push({ orderId, reason: `Đơn hàng đã được gán cho shipper ID ${order.assignToShipperId}.` });
    } else {
      successfulIds.push(parsedOrderId);
    }
  }

  if (successfulIds.length > 0) {
    await Order.update({ assignToShipperId: shipperId }, { where: { orderId: successfulIds } });
  }

  return {
    message: "Hoàn tất quá trình gán đơn hàng hàng loạt.",
    shipperId,
    successCount: successfulIds.length,
    failureCount: failedAssignments.length,
    assignedOrderIds: successfulIds,
    failedAssignments,
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

  const formattedDate = date.toFormat("MM-dd-yyyy");

  const existingRegistration = await Schedule.findOne({
    where: { dayOfWeek: formattedDate },
    include: [
      {
        model: ScheduleShipper,
        as: "ScheduleShippers",
        where: { shipperId },
        required: true,
      },
    ],
  });

  if (existingRegistration) {
    throw new Error(`Bạn đã đăng ký lịch làm việc cho ngày ${formattedDate} rồi.`);
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

  const uniqueShippers = Array.from(new Map(shippers.map((s) => [s.id, s])).values());

  // Với mỗi shipper, đếm số đơn hàng chưa giao xong
  const shippersWithOrderCount = await Promise.all(
    uniqueShippers.map(async (shipper) => {
      const shipperData = shipper.get({ plain: true });

      const activeOrderCount = await Order.count({
        where: {
          assignToShipperId: shipper.id,
          status_id: {
            [Op.ne]: 4,
          },
        },
      });

      shipperData.activeOrderCount = activeOrderCount;
      return shipperData;
    })
  );

  shippersWithOrderCount.sort((a, b) => b.activeOrderCount - a.activeOrderCount);

  return shippersWithOrderCount;
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

const getRegisteredScheduleDates = async (shipperId) => {
  const shipper = await User.findByPk(shipperId);
  if (!shipper || shipper.role !== "Shipper") {
    throw new Error("User is not a shipper");
  }

  const schedules = await Schedule.findAll({
    include: [
      {
        model: ScheduleShipper,
        as: "ScheduleShippers",
        where: { shipperId },
        attributes: [],
      },
    ],
    attributes: ["scheduleId", "dayOfWeek", "startTime", "endTime"],
    order: [["dayOfWeek", "DESC"]],
  });

  const uniqueSchedules = [];
  const seenDates = new Set();

  for (const schedule of schedules) {
    if (!seenDates.has(schedule.dayOfWeek)) {
      uniqueSchedules.push(schedule);
      seenDates.add(schedule.dayOfWeek);
    }
  }

  return uniqueSchedules;
};

module.exports = {
  getShippers,
  assignShipperToOrder,
  registerSchedule,
  updateStartTime,
  updateEndTime,
  getShippersByDate,
  getAssignedOrders,
  getRegisteredScheduleDates,
};

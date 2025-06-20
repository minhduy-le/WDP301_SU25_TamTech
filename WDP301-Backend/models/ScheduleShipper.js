const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ScheduleShipper = sequelize.define(
  "ScheduleShipper",
  {
    scheduleShipperId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shipperId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    scheduleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "schedules",
        key: "scheduleId",
      },
    },
  },
  {
    tableName: "schedule_shippers",
    timestamps: false,
  }
);

module.exports = ScheduleShipper;

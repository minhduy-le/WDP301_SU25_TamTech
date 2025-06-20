const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Schedule = sequelize.define(
  "Schedule",
  {
    scheduleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    dayOfWeek: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
  },
  {
    tableName: "schedules",
    timestamps: false,
  }
);

module.exports = Schedule;

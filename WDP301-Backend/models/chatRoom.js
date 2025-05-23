const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChatRoom = sequelize.define(
  "ChatRoom",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "chat_rooms",
    timestamps: true,
  }
);

module.exports = ChatRoom;

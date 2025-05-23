const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChatRoomUser = sequelize.define(
  "ChatRoomUser",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chatRoomId: {
      type: DataTypes.INTEGER,
      references: {
        model: "chat_rooms",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "chat_room_users",
    timestamps: true,
  }
);

module.exports = ChatRoomUser;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define(
  "Message",
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
    senderId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    content: {
      type: DataTypes.STRING(255),
    },
    receiverId: {
      type: DataTypes.INTEGER,

      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "messages",
    timestamps: true,
  }
);

module.exports = Message;

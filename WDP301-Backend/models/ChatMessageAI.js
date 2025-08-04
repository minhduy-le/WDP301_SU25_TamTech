const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChatMessageAI = sequelize.define(
  "ChatMessageAI",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    responseFromAI: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "chat_message_ai",
    timestamps: true,
  }
);

module.exports = ChatMessageAI;

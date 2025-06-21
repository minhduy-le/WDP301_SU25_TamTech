const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeedbackResponse = sequelize.define(
  "FeedbackResponse",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    feedbackId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "feedback",
        key: "id",
      },
    },
    repliedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    content: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "feedback_responses",
    timestamps: true,
  }
);

module.exports = FeedbackResponse;

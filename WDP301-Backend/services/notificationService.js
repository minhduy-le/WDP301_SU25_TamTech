// WDP301-Backend/services/notificationService.js

const { Op } = require("sequelize");
const { sendPushNotification } = require("../config/firebase");
const Notification = require("../models/notification");
const User = require("../models/user");

const notificationService = {
  async saveFcmToken(userId, fcmToken) {
    if (!userId || !fcmToken) {
      throw new Error("User ID and FCM token are required");
    }
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Use findOrCreate to avoid duplicate tokens for the same user
    await Notification.findOrCreate({
      where: { userId, fcmToken },
      defaults: {
        userId,
        fcmToken,
        title: "FCM Token Registration", // Internal note
        message: `Token registered for user ${userId}`,
      },
    });

    return { message: "FCM token saved successfully" };
  },

  async sendNotificationToUser(userId, title, message) {
    // Find all distinct FCM tokens for the user
    const userNotifications = await Notification.findAll({
      where: { userId, fcmToken: { [Op.ne]: null } },
      attributes: ["fcmToken"],
      group: ["fcmToken"],
    });

    if (!userNotifications || userNotifications.length === 0) {
      console.log(`No FCM tokens found for user ${userId}.`);
      return;
    }

    const tokens = userNotifications.map((n) => n.fcmToken);

    // Create a single notification record in the database for this message
    await Notification.create({
      userId,
      title,
      message,
      fcmToken: null, // This indicates it's a message, not a device registration
    });

    // Send push notification to all registered tokens
    const promises = tokens.map((token) => sendPushNotification(token, title, message));
    await Promise.allSettled(promises);

    return { message: `Notification sent to ${tokens.length} device(s).` };
  },

  async getNotificationsByUserId(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }
    // Fetch only actual messages, not token registration entries
    const notifications = await Notification.findAll({
      where: {
        userId,
        fcmToken: null, // Ensure we only get messages
      },
      order: [["createdAt", "DESC"]],
      limit: 20, // Limit to the latest 20 notifications
    });
    return notifications;
  },
};

module.exports = notificationService;

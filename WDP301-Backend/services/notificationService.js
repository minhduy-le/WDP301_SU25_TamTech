const admin = require("../config/firebase");
const Notification = require("../models/notification");
const User = require("../models/user");

const notificationService = {
  // Save or update FCM token for a user
  async saveFcmToken(userId, fcmToken) {
    if (!userId || !fcmToken) {
      throw new Error("User ID and FCM token are required");
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if notification entry exists for the user
    let notification = await Notification.findOne({ where: { userId } });
    if (notification) {
      // Update existing FCM token
      notification.fcmToken = fcmToken;
      await notification.save();
    } else {
      // Create new notification entry
      notification = await Notification.create({ userId, fcmToken });
    }

    return { message: "FCM token saved successfully" };
  },

  // Send push notification to a user
  async sendNotification(userId, title, message) {
    const notification = await Notification.findOne({ where: { userId } });
    if (!notification || !notification.fcmToken) {
      throw new Error("No FCM token found for this user");
    }

    const payload = {
      notification: {
        title,
        body: message,
      },
      token: notification.fcmToken,
    };

    try {
      const response = await admin.messaging().send(payload);
      // Save notification to database
      await Notification.create({ userId, title, message, fcmToken: notification.fcmToken });
      return { message: "Notification sent successfully", response };
    } catch (error) {
      console.error("Error sending notification:", error.message);
      throw new Error("Failed to send notification");
    }
  },
};

module.exports = notificationService;

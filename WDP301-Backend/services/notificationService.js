// WDP301-Backend/services/notificationService.js
const { getMessaging } = require("firebase-admin/messaging");
const Notification = require("../models/notification");

const notificationService = {
  async sendNotification({ title, message, fcmToken, data }) {
    // Validate inputs
    if (!title) throw "Title cannot be blank";
    if (!message) throw "Message cannot be blank";
    if (!fcmToken) throw "FCM token cannot be blank";
    if (title.length > 100) throw "Title cannot exceed 100 characters";
    if (message.length > 255) throw "Message cannot exceed 255 characters";
    if (fcmToken.length > 1000) throw "FCM token cannot exceed 1000 characters";
    if (data && typeof data !== "object") throw "Data must be an object";

    // Create notification record
    const notification = await Notification.create({
      title,
      message,
      fcmToken,
    });

    try {
      const fcmMessage = {
        token: fcmToken,
        notification: {
          title,
          body: message,
        },
        // Thêm data payload vào tin nhắn FCM
        // Data payload cho phép ứng dụng di động xử lý thông báo một cách linh hoạt
        data: data || {}, // Đảm bảo data là một đối tượng
      };

      console.log("Sending FCM message:", fcmMessage);
      const response = await getMessaging().send(fcmMessage);
      console.log("FCM response:", response);
      return {
        status: 200,
        message: "Notification sent successfully",
      };
    } catch (error) {
      console.error("Error sending FCM notification:", error.message, error.stack);
      throw `Failed to send notification: ${error.message}`;
    }
  },

  async getUserNotifications(userId) {
    if (!userId) throw "User ID cannot be blank";
    const notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    return notifications;
  },
};

module.exports = notificationService;

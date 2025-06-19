// WDP301-Backend/config/firebaseConfig.js

const serviceAccount = require("../utils/serviceAccountKey.json");

// Thay thế ID cũ bằng Project ID mới của bạn ở đây
const storageBucket = "notification-eef47.appspot.com";

module.exports = {
  serviceAccount,
  storageBucket,
};

// WDP301-Backend/config/firebase.js
const { initializeApp, cert } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");
const { getAuth } = require("firebase-admin/auth");
const { getMessaging } = require("firebase-admin/messaging");
const { serviceAccount, storageBucket } = require("./firebaseConfig"); // Sử dụng cấu hình từ firebaseConfig.js

// Khởi tạo Firebase Admin với thông tin xác thực từ serviceAccount
const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: storageBucket,
});

const storage = getStorage(app);
const auth = getAuth(app);
const messaging = getMessaging(app);

const uploadFileToFirebase = async (fileBuffer, fileName, contentType) => {
  const bucket = storage.bucket();
  const remoteFilePath = contentType === "application/pdf" ? `invoices/${fileName}` : `images/${fileName}`;
  const file = bucket.file(remoteFilePath);

  await file.save(fileBuffer, {
    metadata: { contentType: contentType },
  });

  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-09-2491", // Ngày hết hạn rất xa, cần xem xét lại trong môi trường production
  });
  return url;
};

const uploadImageToFirebase = async (imageBuffer, fileName) => {
  const bucket = storage.bucket();
  const file = bucket.file(`images/${fileName}`);
  await file.save(imageBuffer, {
    metadata: { contentType: "image/jpeg" }, // Kiểm tra nếu bạn upload các loại ảnh khác (png, webp...)
  });
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-09-2491", // Ngày hết hạn rất xa, cần xem xét lại trong môi trường production
  });
  return url;
};

module.exports = { uploadFileToFirebase, auth, uploadImageToFirebase, messaging };

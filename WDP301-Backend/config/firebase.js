require("dotenv").config();
const { initializeApp, cert } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");
const { getAuth } = require("firebase-admin/auth");
const { getMessaging } = require("firebase-admin/messaging");

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
  universe_domain: "googleapis.com",
};

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "course-ac11b.appspot.com",
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
    expires: "03-09-2491",
  });
  return url;
};

const uploadImageToFirebase = async (imageBuffer, fileName) => {
  const bucket = storage.bucket();
  const file = bucket.file(`images/${fileName}`);
  await file.save(imageBuffer, {
    metadata: { contentType: "image/jpeg" },
  });
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-09-2491",
  });
  return url;
};

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  const message = {
    notification: {
      title,
      body,
    },
    data: {
      orderId: data.orderId ? String(data.orderId) : null,
      userId: data.userId ? String(data.userId) : null,
      type: "order_notification",
    },
    token: fcmToken,
  };

  try {
    const response = await messaging.send(message);
    console.log("Successfully sent message:", response, "Payload:", JSON.stringify(message, null, 2));
    return response;
  } catch (error) {
    console.error(
      "Error sending message:",
      error.message,
      "Error code:",
      error.code,
      "Payload:",
      JSON.stringify(message, null, 2)
    );
    throw error;
  }
};

module.exports = { uploadFileToFirebase, auth, uploadImageToFirebase, sendPushNotification };

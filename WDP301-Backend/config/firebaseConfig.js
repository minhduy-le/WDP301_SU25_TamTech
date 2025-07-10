import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEgp6wElu9GGzt8VSqrD4Z5JjdaHbAS0U",
  authDomain: "course-ac11b.firebaseapp.com",
  databaseURL: "https://course-ac11b-default-rtdb.firebaseio.com",
  projectId: "course-ac11b",
  storageBucket: "course-ac11b.appspot.com",
  messagingSenderId: "504173119960",
  appId: "1:504173119960:web:0fd66571b4fe6c260c0aad",
  measurementId: "G-XCT1QBJVVF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Register Service Worker for background notifications
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}

// Function to register FCM token
async function registerFcmToken(userId) {
  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return;
    }

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: "BOYKZ4MFMfEBL8WJTLid1bmd-m0Hbq8Aru3jlJTbylPWiHpdxyiKlhU97BtPw3K44Uyn4BLqzzVmsptNvwatdRI",
    });
    console.log("FCM Token:", token);

    // Send token to server
    const response = await fetch("/api/save-fcm-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include Authorization header if required
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth setup
      },
      body: JSON.stringify({ userId, fcmToken: token }),
    });

    if (response.ok) {
      console.log("FCM token saved successfully");
    } else {
      console.error("Failed to save FCM token:", await response.text());
    }
  } catch (error) {
    console.error("Error registering FCM token:", error);
  }
}

// Handle foreground notifications
onMessage(messaging, (payload) => {
  console.log("Foreground message received:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/path/to/icon.png", // Replace with your icon path
    data: payload.data,
  };

  // Show notification
  new Notification(notificationTitle, notificationOptions);
});

// Export functions to be used elsewhere
export { messaging, registerFcmToken };

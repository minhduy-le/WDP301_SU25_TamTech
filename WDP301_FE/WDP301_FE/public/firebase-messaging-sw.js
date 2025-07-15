// Import Firebase scripts for the service worker
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker
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
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Optional: Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message:",
    payload
  );
  // Customize notification here if needed
  const notificationTitle =
    payload.notification?.title || "Background Message Title";
  const notificationOptions = {
    body: payload.notification?.body || "Background Message Body",
    icon: "/favicon.ico", // Replace with your app's icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

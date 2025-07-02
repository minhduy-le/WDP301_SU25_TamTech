import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);
const messaging = getMessaging(app); // Khởi tạo Messaging

export { app, auth, googleProvider, storage, messaging };

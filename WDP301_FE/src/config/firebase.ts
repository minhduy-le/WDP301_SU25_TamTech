import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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

export { app, auth, googleProvider };

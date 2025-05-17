const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");

// Your web app's Firebase configuration
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
const storage = getStorage(app);

const uploadImageToFirebase = async (imageBuffer, fileName) => {
  const storageRef = ref(storage, `images/${fileName}`);
  const snapshot = await uploadBytes(storageRef, imageBuffer);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

module.exports = { uploadImageToFirebase };

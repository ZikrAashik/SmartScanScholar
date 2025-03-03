// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpmWc1j1WU0cEzf64MT3O_9QfeT1lRit8",
  authDomain: "smart-scan-57b05.firebaseapp.com",
  projectId: "smart-scan-57b05",
  storageBucket: "smart-scan-57b05.firebasestorage.app",
  messagingSenderId: "714803168426",
  appId: "1:714803168426:web:ab7c99a6ad4ae53a6cfcd3",
  measurementId: "G-V81Q9BGQVD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
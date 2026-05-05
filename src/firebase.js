// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC72_5n79LaU6U76aOTpAaBAVMmDZDdjiw",
  authDomain: "capstone-app-21baa.firebaseapp.com",
  projectId: "capstone-app-21baa",
  storageBucket: "capstone-app-21baa.firebasestorage.app",
  messagingSenderId: "576335311666",
  appId: "1:576335311666:web:a8e2d68a224ca73e509d2b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)
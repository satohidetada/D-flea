import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBAtZaaHWlSXu1RlXpScylk4thC7mm2PfQ",
  authDomain: "my-flea-app.firebaseapp.com",
  projectId: "my-flea-app",
  storageBucket: "my-flea-app.firebasestorage.app",
  messagingSenderId: "231764746022",
  appId: "1:231764746022:web:771c580ec055dfe2422be7",
  measurementId: "G-R3YH2MYKER"
};

// サーバーサイドでの二重初期化を防止
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwwVdPb65HDP4Nz-tbQr04yQdrfsOjoK0",
  authDomain: "react-project-a6f46.firebaseapp.com",
  projectId: "react-project-a6f46",
  storageBucket: "react-project-a6f46.firebasestorage.app",
  messagingSenderId: "627704603094",
  appId: "1:627704603094:web:fd71b83d1972144d958477",
  measurementId: "G-XG08Y673X2",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null,
);


import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
const firebaseConfig = {
    apiKey: "AIzaSyBVVzJHj2a8z8DEjBAGuvO4zc8fjrm92N8",
    authDomain: "iain-f7c30.firebaseapp.com",
    projectId: "iain-f7c30",
    storageBucket: "iain-f7c30.firebasestorage.app",
    messagingSenderId: "854098983635",
    appId: "1:854098983635:web:30a821bfed2ada47093226",
    measurementId: "G-4BRVSXBWKJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
// C:\Users\Renz Jericho Buday\iain-main-admin\firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- MUST BE IMPORTED

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBVVzJHj2a8z8DEjBAGuvO4zc8fjrm92N8",
    authDomain: "iain-f7c30.firebaseapp.com",
    projectId: "iain-f7c30",
    storageBucket: "iain-f7c30.firebasestorage.app",
    messagingSenderId: "854098983635",
    appId: "1:854098983635:web:30a821bfed2ada47093226",
    measurementId: "G-4BRVSXBWKJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the service references
export const auth = getAuth(app);
export const db = getFirestore(app);
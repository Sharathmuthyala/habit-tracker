import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, doc, setDoc, getDoc, onSnapshot, 
    collection, query, getDocs, deleteDoc, writeBatch, 
    addDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    getAuth, signInAnonymously, onAuthStateChanged,
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyBi8ESQV1hcdr9bG6v-tesiTzscDsGFiyQ",
    authDomain: "habit-tracker-5ad2d.firebaseapp.com",
    projectId: "habit-tracker-5ad2d",
    storageBucket: "habit-tracker-5ad2d.firebasestorage.app",
    messagingSenderId: "704810863965",
    appId: "1:704810863965:web:d63facc167c7de928f2cb4",
    measurementId: "G-SXFYLD0D1C"
};

// Initialize Firebase
let app, db, auth;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Make globally available for app logic
    window.firebaseEnabled = true;
    window.currentUser = null;
    window.db = db;
    window.auth = auth;
    
    // Expose Firestore functions globally for the app to use
    window.fb = {
        doc, setDoc, getDoc, onSnapshot, collection, 
        query, getDocs, deleteDoc, writeBatch, addDoc, 
        serverTimestamp, signInWithEmailAndPassword, 
        createUserWithEmailAndPassword, signOut
    };

    console.log("Firebase initialized successfully");

} catch (error) {
    console.error("Firebase initialization failed:", error);
    window.firebaseEnabled = false;
    
    // Show setup banner if API key is missing/invalid
    if (error.code === 'auth/invalid-api-key' || error.message.includes('API key')) {
        document.addEventListener('DOMContentLoaded', () => {
            const banner = document.getElementById('setupBanner');
            if (banner) banner.classList.add('show');
            
            const authError = document.getElementById('authError');
            if (authError) {
                authError.textContent = "Firebase API Key is missing or invalid. Please check the console.";
                authError.style.display = 'block';
            }
        });
    }
}

export { app, db, auth };

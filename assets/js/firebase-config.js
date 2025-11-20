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
import {
    initializeAppCheck, ReCaptchaV3Provider
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js';

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
let app, db, auth, appCheck;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    // Initialize Firebase App Check
    try {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // For local development - enable debug mode
            // In production, you'll need to add the debug token in Firebase Console
            console.log('🔧 Running in development mode - App Check debug mode enabled');
            console.log('ℹ️  To use App Check locally, add a debug token in Firebase Console:');
            console.log('   1. Go to Firebase Console → App Check');
            console.log('   2. Click "Apps" tab → Your app → "Manage debug tokens"');
            console.log('   3. Add a debug token and paste it in the browser console');

            // Enable debug token mode
            self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        }

        // Initialize App Check with reCAPTCHA v3
        // IMPORTANT: Replace 'YOUR-RECAPTCHA-SITE-KEY' with your actual reCAPTCHA v3 site key
        // Get it from: https://www.google.com/recaptcha/admin
        const recaptchaSiteKey = 'YOUR-RECAPTCHA-SITE-KEY'; // TODO: Replace with your key

        if (recaptchaSiteKey !== 'YOUR-RECAPTCHA-SITE-KEY') {
            appCheck = initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider(recaptchaSiteKey),
                isTokenAutoRefreshEnabled: true
            });
            console.log('✅ Firebase App Check initialized successfully');
        } else {
            console.warn('⚠️  Firebase App Check not configured - Please add your reCAPTCHA site key');
            console.warn('   Get your key from: https://www.google.com/recaptcha/admin');
        }
    } catch (appCheckError) {
        console.error('❌ Firebase App Check initialization failed:', appCheckError);
        console.warn('⚠️  App will continue without App Check protection');
    }

    // Make globally available for app logic
    window.firebaseEnabled = true;
    window.currentUser = null;
    window.db = db;
    window.auth = auth;
    window.appCheck = appCheck;

    // Expose Firestore functions globally for the app to use
    window.fb = {
        doc, setDoc, getDoc, onSnapshot, collection,
        query, getDocs, deleteDoc, writeBatch, addDoc,
        serverTimestamp, signInWithEmailAndPassword,
        createUserWithEmailAndPassword, signOut
    };

    console.log("✅ Firebase initialized successfully");

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

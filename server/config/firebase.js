
const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let serviceAccount;

try {
    // Try to load from file (Local Dev)
    serviceAccount = require('../serviceAccountKey.json');
    console.log("🔥 Loaded Firebase credentials from serviceAccountKey.json");
} catch (e) {
    // Try to load from Environment Variable (Render Production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            console.log("🔥 Loaded Firebase credentials from Environment Variable");
        } catch (parseError) {
            console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var");
        }
    }
}

if (!serviceAccount) {
    console.error("❌ CRITICAL: No Firebase credentials found! (Missing serviceAccountKey.json OR FIREBASE_SERVICE_ACCOUNT env var)");
    // We don't exit process here to allow the server to start and log the error, 
    // but DB calls will fail.
} else {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("✅ Firebase Admin Initialized");
    } catch (initError) {
        if (initError.code === 'app/already-exists') {
            // Ignore if already initialized
            console.log("✅ Firebase Admin already initialized");
        } else {
            console.error("❌ Firebase Init Error:", initError);
        }
    }
}

const db = admin.firestore();
module.exports = { db, admin };

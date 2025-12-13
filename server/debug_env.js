require('dotenv').config();
console.log("--- DEBUG START ---");
console.log("RAW EMAIL_USER:", process.env.EMAIL_USER);
console.log("RAW EMAIL_PASS:", process.env.EMAIL_PASS ? "EXISTS (Hidden)" : "MISSING");
console.log("--- DEBUG END ---");

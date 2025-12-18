
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log("User:", process.env.EMAIL_USER);
    console.log("Pass (length):", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.verify();
        console.log("✅ SMTP Configuration is correct.");

        // Uncomment to actually send
        // await transporter.sendMail({ from: process.env.EMAIL_USER, to: process.env.EMAIL_USER, subject: 'Test', text: 'It works!' });
        // console.log("✅ Email sent.");
    } catch (err) {
        console.error("❌ SMTP Error:", err);
    }
}

testEmail();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

async function testLogin() {
    try {
        console.log("1. Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("2. Connected.");

        const email = 'kokachi';
        const password = 'kokachi@admin';

        console.log(`3. Finding user with email: '${email}'...`);
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log("❌ User NOT found.");
            return;
        }
        console.log("✅ User found:", user.email, "| Role:", user.role);

        console.log("4. Comparing password...");
        if (!user.password) {
            console.log("❌ CRITICAL: User has NO password field!");
        } else {
            console.log("   Hash found:", user.password.substring(0, 10) + "...");
            const isValid = await bcrypt.compare(password, user.password);
            console.log("5. Password valid?", isValid);
        }

    } catch (error) {
        console.error("💥 CRASH TRACE:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

testLogin();

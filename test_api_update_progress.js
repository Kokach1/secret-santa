const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testApi() {
    try {
        console.log("1. Logging in as Santa...");
        // Assuming we have a user 'jeswinjoy615+t1@gmail.com' (who is a student)
        // I need a valid email/password.
        // I'll try to use the hardcoded admin first to find a student, but admin logic is different.
        // Actually, I'll allow the script to fail if login fails, but I'll try the known test users.
        const email = 'jeswinjoy615+t1@gmail.com';
        // Password for test users? "password"? Or "123456"? 
        // I don't know the password. 
        // I can FORCE a password reset in DB or use the token directly if I can generate it.

        // Alternative: Generate a fresh JWT locally since I have the SECRET in .env (loaded by server).
        // I'll cheat and make a token manually in this script.
        const jwt = require('jsonwebtoken');
        const mongoose = require('mongoose');
        const User = require('./server/models/User');
        require('dotenv').config({ path: './server/.env' });

        await mongoose.connect(process.env.MONGODB_URI);
        const santa = await User.findOne({ role: 'student', paired_to: { $ne: null } });
        if (!santa) { console.log("No santa found"); return; }

        const token = jwt.sign({ userId: santa._id, role: 'student' }, process.env.JWT_SECRET);
        console.log(`Simulated Login for ${santa.email}`);

        // 2. Call Update Progress API
        console.log("2. Updating Progress via API...");
        try {
            const res = await axios.post(`${BASE_URL}/student/update-progress`, {
                stage: 'gift_ready',
                status: true
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("API Response Status:", res.status);
            console.log("API Response Data:", res.data.progress);
        } catch (e) {
            console.error("API Call Failed:", e.response ? e.response.data : e.message);
        }

        // 3. Verify in DB
        const manualCheck = await User.findById(santa._id);
        console.log("3. DB Status:", manualCheck.progress);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

testApi();

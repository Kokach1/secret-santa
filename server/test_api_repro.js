const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('./models/User');

const BASE_URL = 'http://localhost:5000';

async function testApi() {
    try {
        console.log("1. Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);

        const santa = await User.findOne({ role: 'student', paired_to: { $ne: null } });
        if (!santa) { console.log("No santa found"); return; }

        console.log(`2. Found Santa: ${santa.email}`);
        const token = jwt.sign({ userId: santa._id, role: 'student' }, process.env.JWT_SECRET);

        console.log("3. Calling API update...");
        const res = await fetch(`${BASE_URL}/student/update-progress`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stage: 'gift_ready', status: true })
        });

        if (res.ok) {
            const data = await res.json();
            console.log("API Success:", data.progress);
        } else {
            console.log("API Error:", res.status, res.statusText);
            const txt = await res.text();
            console.log(txt);
        }

        // Check DB
        const manualCheck = await User.findById(santa._id);
        console.log("4. DB Verification:", manualCheck.progress);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

testApi();

const mongoose = require('mongoose');
const MagicToken = require('./server/models/MagicToken');
require('dotenv').config({ path: './server/.env' });

async function getLink() {
    await mongoose.connect(process.env.MONGODB_URI);

    const tokenRecord = await MagicToken.findOne({ email: 'student@cek.ac.in' }).sort({ createdAt: -1 });
    if (tokenRecord) {
        console.log('Token Found (Hashed):', tokenRecord.tokenHashed);
        console.log('Cannot reverse hash. Please check your email or server logs if available.');
        // Actually, since I can't reverse hash, I can't generate the link unless I intercept it at creation.
        // But I can create a new user manually and issue a JWT.
    }

    await mongoose.disconnect();
}

getLink();

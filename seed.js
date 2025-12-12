const mongoose = require('mongoose');
const User = require('./server/models/User');
require('dotenv').config({ path: './server/.env' });

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Create Admin
    await User.findOneAndUpdate(
        { email: 'admin@cek.ac.in' },
        {
            name: 'Admin User',
            role: 'admin',
            approved: true
        },
        { upsert: true }
    );
    console.log('✅ Admin seeded: admin@cek.ac.in');

    // Create Student
    await User.findOneAndUpdate(
        { email: 'student@cek.ac.in' },
        {
            name: 'Test Student',
            role: 'student',
            department: 'CS',
            year: '2025',
            approved: true,
            progress: { gift_ready: false, gift_delivered: false, gift_received: false }
        },
        { upsert: true }
    );
    console.log('✅ Student seeded: student@cek.ac.in');

    await mongoose.disconnect();
}

seed();

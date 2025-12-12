const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');
require('dotenv').config({ path: './server/.env' });

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const hashedPassword = await bcrypt.hash('kokachi@admin', 10);

        await User.findOneAndUpdate(
            { email: 'kokachi' }, // Treating 'kokachi' as the unique ID/Email
            {
                name: 'Super Admin',
                role: 'admin',
                approved: true,
                password: hashedPassword
            },
            { upsert: true, new: true }
        );

        console.log('✅ Admin "kokachi" seeded successfully with password.');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedAdmin();

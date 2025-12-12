const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');
require('dotenv').config({ path: './server/.env' });

async function forceSeed() {
    try {
        console.log('🔌 Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected.');

        const passwordPlain = 'kokachi@admin';
        const hashedPassword = await bcrypt.hash(passwordPlain, 10);

        // Delete first to be sure
        await User.deleteOne({ email: 'kokachi' });

        const result = await User.create({
            email: 'kokachi',
            name: 'Super Admin',
            role: 'admin',
            approved: true,
            password: hashedPassword
        });

        console.log('✅ Admin "kokachi" RE-CREATED successfully.');
        console.log('ID:', result._id);
        console.log('Password Hash:', result.password.substring(0, 10) + '...');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected.');
    }
}

forceSeed();

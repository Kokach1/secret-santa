const mongoose = require('mongoose');
const User = require('./server/models/User');
require('dotenv').config({ path: './server/.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const users = await User.find({}).select('+password');
        console.log('--- USERS IN DB ---');
        users.forEach(u => {
            console.log({
                id: u._id,
                email: u.email,
                role: u.role,
                passwordExists: !!u.password,
                passwordHash: u.password ? u.password.substring(0, 10) + '...' : 'NONE'
            });
        });
        console.log('-------------------');

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

check();

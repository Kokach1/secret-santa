const mongoose = require('mongoose');
const User = require('./server/models/User');
const fs = require('fs');
require('dotenv').config({ path: './server/.env' });

async function check() {
    let output = '';
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        output += 'Connected to DB.\n';

        const users = await User.find({}).select('+password');
        output += `Found ${users.length} users.\n`;

        users.forEach(u => {
            output += `ID: ${u._id} | Email: '${u.email}' | Role: ${u.role} | Pwd: ${u.password ? 'YES' : 'NO'}\n`;
        });

    } catch (error) {
        output += `Error: ${error.message}\n`;
    } finally {
        await mongoose.disconnect();
        fs.writeFileSync('db_dump.txt', output);
    }
}

check();

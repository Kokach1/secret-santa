const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const users = await User.find({ role: 'student' }).select('email isVerified detailsCompleted approved');
        const fs = require('fs');
        fs.writeFileSync('debug_output.json', JSON.stringify(users, null, 2));
        console.log("Written to debug_output.json");
        process.exit();
    })
    .catch(err => console.error(err));

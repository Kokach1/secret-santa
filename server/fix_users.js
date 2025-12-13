const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        // Force verify all students
        await User.updateMany(
            { role: 'student' },
            { isVerified: true, detailsCompleted: true }
        );
        console.log("All students force-verified!");
        process.exit();
    })
    .catch(err => console.error(err));

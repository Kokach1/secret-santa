const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Debug Mode: Allow all
// app.use(cors({
//    origin: process.env.FRONTEND_URL,
//    credentials: true
// }));
app.use(express.json());

// Database Connection
const User = require('./models/User'); // Ensure path is correct
const bcrypt = require('bcryptjs');

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB Connected');

        // AUTO-SEED ADMIN
        try {
            const adminEmail = 'kokachi';
            const existingAdmin = await User.findOne({ email: adminEmail });
            if (!existingAdmin || !existingAdmin.password) {
                console.log('⚡ Seeding Admin User...');
                const hashedPassword = await bcrypt.hash('kokachi@admin', 10);
                await User.findOneAndUpdate(
                    { email: adminEmail },
                    {
                        name: 'Super Admin',
                        role: 'admin',
                        approved: true,
                        password: hashedPassword
                    },
                    { upsert: true }
                );
                console.log('✅ Admin "kokachi" seeded via Server.');
            }
        } catch (err) {
            console.error('❌ Seeding Error:', err);
        }
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('🎄 Secret Santa API is running! 🎅');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

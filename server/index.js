const express = require('express');
// const mongoose = require('mongoose'); // Removed for Firebase
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'https://secret-santa-cek.onrender.com'];
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Database Connection
// Database Connection (Firebase initialized internally in models)
const User = require('./models/User'); // Ensure path is correct
const bcrypt = require('bcryptjs');

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('🎄 Secret Santa API is running! 🎅 (Firebase Edition)');
});

// Auto-Seed Admin on Start
async function seedAdmin() {
    try {
        const adminEmail = 'kokachi';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            console.log('⚡ Seeding Admin User...');
            const hashedPassword = await bcrypt.hash('kokachi@admin', 10);
            await User.create({
                email: adminEmail,
                name: 'Super Admin',
                role: 'admin',
                approved: true,
                password: hashedPassword
            });
            console.log('✅ Admin "kokachi" seeded via Server.');
        }
    } catch (err) {
        console.error('❌ Seeding Error:', err);
    }
}
seedAdmin();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

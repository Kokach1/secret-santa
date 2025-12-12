const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, department, semester, mobile } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            password_plain: password, // Store plain for admin
            department,
            semester,
            mobile,
            role: 'student',
            approved: true // Auto-approve
        });

        const token = jwt.sign(
            { userId: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
                name: newUser.name,
                semester: newUser.semester,
                department: newUser.department
            }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /auth/login (Unified)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });

        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                department: user.department,
                semester: user.semester
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /auth/request-magic-link
router.post('/request-magic-link', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate Token
        const token = require('crypto').randomBytes(32).toString('hex');
        const tokenHashed = await bcrypt.hash(token, 10);

        // Save Token (using temporary MagicToken model or User field - going with User field for simplicity if not exists, but we have MagicToken model)
        // Let's use MagicToken model (need to import it)
        const MagicToken = require('../models/MagicToken');
        await MagicToken.create({
            email,
            tokenHashed,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
        });

        // Send Email (Resend)
        if (process.env.RESEND_API_KEY) {
            const { Resend } = require('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);
            const link = `${process.env.FRONTEND_URL}/verify?token=${token}&email=${email}`;

            await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: email,
                subject: 'Your Magic Login Link 🎄',
                html: `<p>Click here to login: <a href="${link}">${link}</a></p>`
            });
            console.log(`Magic Link sent to ${email}`);
        } else {
            console.log(`[DEV] Magic Link: ${process.env.FRONTEND_URL}/verify?token=${token}&email=${email}`);
        }

        res.json({ message: 'Magic link sent!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /auth/verify
router.get('/verify', async (req, res) => {
    try {
        const { email, token } = req.query;
        const MagicToken = require('../models/MagicToken');

        const record = await MagicToken.findOne({ email }).sort({ createdAt: -1 });
        if (!record) return res.status(400).json({ message: 'Invalid or expired link' });

        const isValid = await bcrypt.compare(token, record.tokenHashed);
        if (!isValid) return res.status(400).json({ message: 'Invalid token' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const jwtToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token: jwtToken,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                semester: user.semester,
                department: user.department
            }
        });

        // Cleanup used tokens
        await MagicToken.deleteMany({ email });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

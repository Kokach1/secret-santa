const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and Password are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User (Pending Verification)
        const newUser = await User.create({
            email,
            password: hashedPassword,
            password_plain: password,
            role: 'student',
            approved: true, // "Approved" by admin logic, but waits for email verify
            isVerified: false,
            detailsCompleted: false
        });

        // Generate Verification Token
        const token = require('crypto').randomBytes(32).toString('hex');
        const tokenHashed = await bcrypt.hash(token, 10);
        const MagicToken = require('../models/MagicToken');

        await MagicToken.create({
            email,
            tokenHashed,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

        if (process.env.EMAIL_USER) {
            try {
                // Configure Nodemailer for Gmail
                const nodemailer = require('nodemailer');
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: `"Secret Santa Team 🎅" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Verify your Secret Santa Account 🎄 (Link Inside)',
                    html: `
                        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                            <h2 style="color: #d42426; text-align: center;">Welcome to Secret Santa! 🎅</h2>
                            <p>Hi there,</p>
                            <p>Please click the button below to verify your email and complete your registration.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${link}" style="background-color: #166534; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
                            </div>
                            <p style="font-size: 12px; color: #666; text-align: center;">Or copy this link: <br/>${link}</p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log(`Verification Email sent to ${email} via Gmail`);
            } catch (emailError) {
                console.error("Gmail Send Failed:", emailError);
                console.log("FALLBACK LINK (Use this if email fails):", link);
            }
            console.log(`[BACKUP LOG] Link: ${link}`);
        } else {
            console.log(`[DEV] Verification Link: ${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`);
        }

        res.json({ message: 'Verification link sent to your email!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /auth/login - Update to check verification
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
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
            token, user: {
                id: user._id, email: user.email, role: user.role,
                isVerified: user.isVerified, detailsCompleted: user.detailsCompleted
            }
        });
    } catch (error) {
        console.error("LOGIN CRASH:", error);
        res.status(500).json({ message: 'Server error: ' + error.message });
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

// GET /auth/verify-email
router.get('/verify-email', async (req, res) => {
    try {
        const { email, token } = req.query;
        const MagicToken = require('../models/MagicToken');

        const record = await MagicToken.findOne({ email }).sort({ createdAt: -1 });
        if (!record) return res.status(400).json({ message: 'Link expired or invalid' });

        const isValid = await bcrypt.compare(token, record.tokenHashed);
        if (!isValid) return res.status(400).json({ message: 'Invalid token' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Mark Verified
        user.isVerified = true;
        await user.save();

        const jwtToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Cleanup
        await MagicToken.deleteMany({ email });

        res.json({
            token: jwtToken,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                isVerified: true,
                detailsCompleted: user.detailsCompleted
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /auth/complete-profile
router.post('/complete-profile', require('../middleware/auth')(['student', 'admin']), async (req, res) => {
    try {
        const { name, department, semester, mobile } = req.body;

        if (!name || !department || !semester || !mobile) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findByIdAndUpdate(req.user.userId, {
            name,
            department,
            semester,
            mobile,
            detailsCompleted: true
        }, { new: true });

        res.json({ user, message: 'Profile completed!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

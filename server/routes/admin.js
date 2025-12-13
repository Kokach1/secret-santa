const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Notification = require('../models/Notification');

// GET /admin/students
router.get('/students', auth(['admin']), async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('+password_plain')
            .populate('paired_to', 'name department')
            .sort({ createdAt: -1 });
        const settings = await Settings.findOne({ key: 'global_config' });
        res.json({ students, settings });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /admin/approve-student
router.post('/approve-student', auth(['admin']), async (req, res) => {
    try {
        const { studentId } = req.body;
        await User.findByIdAndUpdate(studentId, { approved: true });
        res.json({ message: 'Student approved' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /admin/set-deadline
router.post('/set-deadline', auth(['admin']), async (req, res) => {
    try {
        const { deadline } = req.body;
        await Settings.findOneAndUpdate(
            { key: 'global_config' },
            { registration_deadline: deadline },
            { upsert: true, new: true }
        );
        res.json({ message: 'Deadline updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /admin/student/:id
router.delete('/student/:id', auth(['admin']), async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await User.findByIdAndDelete(req.params.id);

        // Remove from pairings safely
        await User.updateMany({ paired_to: req.params.id }, { paired_to: null });

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /admin/pair-students
router.post('/pair-students', auth(['admin']), async (req, res) => {
    try {
        // 1. Fetch all approved students
        // 1. Fetch all approved students who are verified and have completed details
        const students = await User.find({
            role: 'student',
            approved: true,
            isVerified: true,
            detailsCompleted: true
        });

        if (students.length < 2) {
            return res.status(400).json({ message: 'Not enough eligible students (Verified & Profile Completed) to pair' });
        }

        // 2. Shuffle Mechanism (Fisher-Yates)
        let shuffled = [...students];

        // Simple Fisher-Yates shuffle
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // 3. Apply PAIRING (Overwrite existing)
        const writeOps = shuffled.map((giver, index) => {
            const receiver = shuffled[(index + 1) % shuffled.length];
            return {
                updateOne: {
                    filter: { _id: giver._id },
                    update: { paired_to: receiver._id }
                }
            };
        });

        await User.bulkWrite(writeOps);

        // 4. Update Settings
        await Settings.findOneAndUpdate(
            { key: 'global_config' },
            { pairing_done: true },
            { upsert: true }
        );

        res.json({ message: `Successfully paired ${students.length} students! (Previous pairings overwritten)` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Pairing failed: ' + error.message });
    }
});

// POST /admin/reset-pairing (Emergency only)
router.post('/reset-pairing', auth(['admin']), async (req, res) => {
    try {
        await User.updateMany({ role: 'student' }, { paired_to: null, progress: { gift_ready: false, gift_delivered: false, gift_received: false } });
        await Settings.findOneAndUpdate({ key: 'global_config' }, { pairing_done: false });
        res.json({ message: 'Pairing reset.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /admin/send-notification
router.post('/send-notification', auth(['admin']), async (req, res) => {
    try {
        const { title, message } = req.body;
        await Notification.create({ title, message, visible_to: 'students' });
        res.json({ message: 'Notification sent' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

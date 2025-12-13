const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');

// GET /student/me - Dashboard Data
router.get('/me', auth(['student', 'admin']), async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('paired_to', 'name department semester mobile');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Fetch Global Settings (Deadline)
        const settings = await Settings.findOne({ key: 'global_config' });

        // Find the user's Santa (who is paired TO this user)
        const mySanta = await User.findOne({ paired_to: req.user.userId }).select('progress name');
        // Note: Sharing Santa's name might spoil it? Usually Secret Santa implies Santa is anonymous until the end.
        // User asked "status of their santa should be visible". I will return progress only initially, or maybe name if revealed?
        // Let's return progress. The prompt implies just 'status' is visible.

        res.json({
            user,
            deadline: settings?.registration_deadline || null,
            pairing_done: settings?.pairing_done || false,
            santa_progress: mySanta ? mySanta.progress : null
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /student/update-progress
router.post('/update-progress', auth(['student']), async (req, res) => {
    try {
        const { stage, status } = req.body; // stage: 'gift_ready', 'gift_delivered', 'gift_received'

        if (!['gift_ready', 'gift_delivered', 'gift_received'].includes(stage)) {
            return res.status(400).json({ message: 'Invalid stage' });
        }

        const update = {};
        update[`progress.${stage}`] = status;

        const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true })
            .populate('paired_to', 'name department semester mobile'); // Persist Child Data
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /student/notifications
router.get('/notifications', auth(['student']), async (req, res) => {
    try {
        const notifications = await Notification.find({
            visible_to: { $in: ['students', 'all'] }
        }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

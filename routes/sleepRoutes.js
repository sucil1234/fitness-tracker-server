const express = require('express');
const router = express.Router();
const Sleep = require('../models/sleep');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/sleep/log
// @desc    Log a new sleep session for the authenticated user
// @access  Private
router.post('/log', authMiddleware, async (req, res) => {
    const { startTime, endTime } = req.body;

    // Basic validation
    if (!startTime || !endTime) {
        return res.status(400).json({ msg: 'Please provide both a start and end time.' });
    }

    try {
        const newSleep = new Sleep({
            userId: req.user.userId,
            startTime: new Date(startTime),
            endTime: new Date(endTime)
        });

        // The pre-save hook in the Sleep model will automatically calculate the duration.
        await newSleep.save();

        res.status(201).json(newSleep);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/sleep/today
// @desc    Get the latest sleep session for the current day
// @access  Private
router.get('/today', authMiddleware, async (req, res) => {
    try {
        // Get the start and end of the current day
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        // Find the most recent sleep record for the user that started today
        const sleepSession = await Sleep.findOne({
            userId: req.user.userId,
            date: {
                $gte: startOfToday,
                $lte: endOfToday
            }
        }).sort({ date: -1 }); // Sort by date descending to get the latest one

        if (!sleepSession) {
            return res.status(404).json({ msg: 'No sleep session found for today.' });
        }

        res.json(sleepSession);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
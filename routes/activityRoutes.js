const express = require('express');
const router = express.Router();
const Activity = require('../models/activity');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you are using this

// POST route to add a new activity
router.post('/', authMiddleware, async (req, res) => {
    const { day, totalCalories, duration, steps, waterIntake, heartRate, plan } = req.body;
    const userId = req.user.userId;

    // The fields to find the document by.
    const query = { userId, day };

    // The data to update the document with.
    const update = {
        totalCalories,
        duration,
        steps,
        waterIntake,
        heartRate,
        plan,
        date: new Date() // Also update the date to the latest update time
    };

    // Options for the operation.
    // upsert: true -> creates the document if it doesn't exist.
    // new: true -> returns the document after the update has been applied.
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    try {
        const activity = await Activity.findOneAndUpdate(query, update, options);
        res.status(200).json(activity);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/day/:day', authMiddleware, async (req, res) => {
    const { day } = req.params;
    const userId = req.user.userId; // Assuming req.user is populated from the auth middleware

    try {
        const activity = await Activity.findOne({ userId, day });
        if (!activity) {
            return res.status(404).json({ msg: 'No activity found for this day' });
        }
        res.json(activity);
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get insights or activity data for a specific period (daily, weekly, etc.)
router.get('/insights/:period', authMiddleware, async (req, res) => {
    const { period } = req.params;
    const userId = req.user.userId;  // Get userId from the authenticated request

    try {
        let activities;
        const today = new Date();
        let startDate;

        // Handle different periods (day, week, month)
        switch (period) {
            case 'day':
                startDate = new Date(today.setHours(0, 0, 0, 0));  // Get today’s data
                break;
            case 'week':
                startDate = new Date(today.setDate(today.getDate() - 7));  // Get last 7 days data
                break;
            case 'month':
                startDate = new Date(today.setMonth(today.getMonth() - 1));  // Get last 30 days data
                break;
            case 'year':
                startDate = new Date(today.setFullYear(today.getFullYear() - 1));  // Get last year’s data
                break;
            default:
                return res.status(400).json({ msg: 'Invalid period' });
        }

        activities = await Activity.find({
            userId,
            date: { $gte: startDate }
        });

        const summary = {
            totalSteps: activities.reduce((acc, cur) => acc + cur.steps, 0),
            totalCalories: activities.reduce((acc, cur) => acc + cur.totalCalories, 0),
            totalDuration: activities.reduce((acc, cur) => acc + cur.duration, 0),
            activities
        };

        res.json(summary);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST route to insert activity data for user
router.post('/add-activity', authMiddleware, async (req, res) => {
    const { userId } = req.user; // Get the userId from the middleware after authentication
    const { day, totalCalories, steps, duration, waterIntake, heartRate, plan } = req.body;

    try {
        const newActivity = new Activity({
            userId: userId, // Will be 66f7cdc068a47a4167c4a0b0 after authentication
            day,
            totalCalories,
            steps,
            duration,
            waterIntake,
            heartRate,
            plan
        });

        await newActivity.save();
        res.status(201).json(newActivity);
    } catch (error) {
        res.status(500).json({ message: 'Error saving activity data', error });
    }
});

module.exports = router;

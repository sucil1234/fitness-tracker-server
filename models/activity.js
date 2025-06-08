const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    day: {
        type: String,
        required: true
    },
    totalCalories: {
        type: Number,
        required: true
    },
    duration: {
        type: Number, // In hours
        required: true
    },
    steps: {
        type: Number,
        required: true
    },
    waterIntake: {
        type: Number, // In cups
        required: true
    },
    heartRate: {
        type: Number, // Beats per minute (bpm)
        required: true
    },
    plan: {
        type: String, // Activity plan for the day
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Activity', activitySchema);

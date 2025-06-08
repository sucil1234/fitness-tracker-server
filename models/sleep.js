const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The time the user went to sleep
    startTime: {
        type: Date,
        required: true
    },
    // The time the user woke up
    endTime: {
        type: Date,
        required: true
    },
    // The total sleep duration, stored in minutes
    duration: {
        type: Number
    },
    // The date the sleep session started on, for easy querying
    date: {
        type: Date,
        default: Date.now
    }
});

// This is a pre-save hook that automatically runs before a document is saved
// It calculates the sleep duration in minutes and stores it in the 'duration' field
sleepSchema.pre('save', function(next) {
    if (this.isModified('startTime') || this.isModified('endTime')) {
        const durationInMilliseconds = this.endTime.getTime() - this.startTime.getTime();
        this.duration = Math.round(durationInMilliseconds / (1000 * 60)); // Convert milliseconds to minutes
    }
    next();
});

module.exports = mongoose.model('Sleep', sleepSchema);
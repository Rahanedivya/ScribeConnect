const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    volunteerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer',
        default: null,
        index: true
    },
    subject: {
        type: String,
        required: true
    },
    examType: {
        type: String,
        required: true
    },
    examDate: {
        type: Date,
        required: true
    },
    examTime: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    requirements: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled', 'declined_by_volunteer', 'cancelled_by_student', 'volunteer_no_show'],
        default: 'pending',
        index: true
    },
    // Cancellation/Decline reason
    declineReason: {
        type: String,
        default: null
    },
    // Request Type
    requestType: {
        type: String,
        enum: ['NORMAL', 'LAST_MINUTE'],
        default: 'NORMAL',
        index: true
    },
    // Last Minute Support
    urgent: {
        type: Boolean,
        default: false,
        index: true
    },
    cancellationReason: {
        type: String,
        default: null
    },
    // Rating (after completion)
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: {
        type: String
    },
    // Payment (for paid volunteers)
    totalAmount: {
        type: Number,
        default: 0
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    // Reference materials
    materials: [{
        type: String
    }]
}, {
    timestamps: true
});

// Index for faster queries
requestSchema.index({ status: 1, examDate: 1 });
requestSchema.index({ studentId: 1, status: 1 });
requestSchema.index({ volunteerId: 1, status: 1 });

module.exports = mongoose.model('Request', requestSchema);

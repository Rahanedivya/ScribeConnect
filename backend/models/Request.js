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

// virtual field for days remaining until examDate
requestSchema.virtual('daysRemaining').get(function() {
    if (!this.examDate) return null;
    const now = new Date();
    const diffMs = this.examDate - now;
    // round up so that anything less than 24h shows as 1 day
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
});

// automatically mark request urgent if exam is within 3 days at save time
requestSchema.pre('save', async function() {
    if (this.examDate) {
        const now = new Date();
        const diffDays = Math.ceil((this.examDate - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) {
            this.urgent = true;
        }
    }
});

// also handle updates where examDate may change
requestSchema.pre('findOneAndUpdate', async function() {
    const update = this.getUpdate();
    if (update && update.examDate) {
        const now = new Date();
        const exam = new Date(update.examDate);
        const diffDays = Math.ceil((exam - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) {
            update.urgent = true;
        }
    }
});

module.exports = mongoose.model('Request', requestSchema);

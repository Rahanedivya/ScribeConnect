const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    fullName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    // Payment Preferences
    volunteerType: {
        type: String,
        enum: ['free', 'paid'],
        default: 'free',
        required: true
    },
    hourlyRate: {
        type: Number,
        default: 0
    },
    // Location
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    remoteAvailable: {
        type: Boolean,
        default: false
    },
    // Skills
    subjects: [{
        type: String
    }],
    languages: [{
        type: String
    }],
    // Availability Schedule
    availability: {
        monday: {
            morning: { type: Boolean, default: false },
            afternoon: { type: Boolean, default: false },
            evening: { type: Boolean, default: false }
        },
        tuesday: {
            morning: { type: Boolean, default: false },
            afternoon: { type: Boolean, default: false },
            evening: { type: Boolean, default: false }
        },
        wednesday: {
            morning: { type: Boolean, default: false },
            afternoon: { type: Boolean, default: false },
            evening: { type: Boolean, default: false }
        },
        thursday: {
            morning: { type: Boolean, default: false },
            afternoon: { type: Boolean, default: false },
            evening: { type: Boolean, default: false }
        },
        friday: {
            morning: { type: Boolean, default: false },
            afternoon: { type: Boolean, default: false },
            evening: { type: Boolean, default: false }
        },
        saturday: {
            morning: { type: Boolean, default: false },
            afternoon: { type: Boolean, default: false },
            evening: { type: Boolean, default: false }
        },
        sunday: {
            morning: { type: Boolean, default: false },
            afternoon: { type: Boolean, default: false },
            evening: { type: Boolean, default: false }
        }
    },
    // Performance Metrics
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalAssignments: {
        type: Number,
        default: 0
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    // No-Show Tracking
    noShowCount: {
        type: Number,
        default: 0
    },
    lastNoShowDate: {
        type: Date,
        default: null
    },
    suspensionEndDate: {
        type: Date,
        default: null
    },
    certifications: [{
        name: String,
        issuedDate: Date,
        fileUrl: String
    }],
    // Verification
    isVerified: {
        type: Boolean,
        default: false
    },
    // Last Minute Support
    lastMinuteAvailable: {
        type: Boolean,
        default: false,
        index: true
    },
    lastMinuteCount: {
        type: Number,
        default: 0
    },
    lastMinuteHero: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Volunteer', volunteerSchema);

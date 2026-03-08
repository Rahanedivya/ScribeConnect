const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    university: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    // Disability Information
    disabilityType: {
        type: String,
        required: true,
        enum: ['Visual Impairment', 'Hearing Impairment', 'Motor Disability', 'Learning Disability', 'Multiple Disabilities', 'Other']
    },
    certificateNumber: {
        type: String
    },
    specificNeeds: {
        type: String,
        required: true
    },
    // Academic Requirements
    currentYear: {
        type: String,
        required: true
    },
    examFrequency: {
        type: String,
        required: true,
        enum: ['Weekly', 'Monthly', 'Quarterly', 'Semester-wise']
    },
    preferredSubjects: [{
        type: String
    }],
    academicNotes: {
        type: String
    },
    // Communication Preferences
    preferredLanguage: {
        type: String,
        required: true
    },
    notificationMethod: {
        type: String,
        required: true,
        enum: ['Email', 'SMS', 'WhatsApp', 'All']
    },
    preferredTime: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);

const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    senderRole: {
        type: String,
        enum: ['student', 'volunteer'],
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: true,
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    volunteerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer',
        required: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    messages: [chatMessageSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Request = require('../models/Request');
const ChatSession = require('../models/ChatSession');
const Student = require('../models/Student');
const Volunteer = require('../models/Volunteer');

const authorizeForChat = async (req, res, next) => {
    try {
        const request = await Request.findById(req.params.requestId || req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (req.user.role === 'student') {
            const student = await Student.findOne({ userId: req.user._id });
            if (!student || request.studentId.toString() !== student._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to access this chat' });
            }
        } else if (req.user.role === 'volunteer') {
            const volunteer = await Volunteer.findOne({ userId: req.user._id });
            if (!volunteer || request.volunteerId?.toString() !== volunteer._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to access this chat' });
            }
        } else {
            return res.status(403).json({ message: 'Not authorized to access this chat' });
        }

        req.request = request;
        next();
    } catch (error) {
        next(error);
    }
};

// @desc    Get chat session for a request
// @route   GET /api/v1/chat/:requestId
// @access  Private (Student/Volunteer)
router.get('/:requestId', protect, authorizeForChat, async (req, res, next) => {
    try {
        const chatSession = await ChatSession.findOne({
            requestId: req.request._id,
            isActive: true
        }).populate('studentId', 'fullName userId').populate('volunteerId', 'fullName userId');

        if (!chatSession) {
            return res.status(404).json({ message: 'Chat session not found' });
        }

        res.json(chatSession);
    } catch (error) {
        next(error);
    }
});

// @desc    Send a message in the chat for a request
// @route   POST /api/v1/chat/:requestId/messages
// @access  Private (Student/Volunteer)
router.post('/:requestId/messages', protect, authorizeForChat, async (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Message text is required' });
        }

        const chatSession = await ChatSession.findOne({
            requestId: req.request._id,
            isActive: true
        });

        if (!chatSession) {
            return res.status(404).json({ message: 'Chat session not found' });
        }

        const senderRole = req.user.role === 'student' ? 'student' : 'volunteer';
        const senderId = req.user.role === 'student'
            ? (await Student.findOne({ userId: req.user._id }))._id
            : (await Volunteer.findOne({ userId: req.user._id }))._id;

        chatSession.messages.push({
            senderRole,
            senderId,
            text: text.trim()
        });

        await chatSession.save();

        res.json(chatSession);
    } catch (error) {
        next(error);
    }
});

module.exports = router;

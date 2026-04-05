const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const Volunteer = require('../models/Volunteer');
const Request = require('../models/Request');
const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/v1/admin/students
// @access  Private (Admin)
router.get('/students', protect, authorize('admin'), async (req, res, next) => {
    try {
        const students = await Student.find().populate('userId', 'email isActive createdAt');
        res.json(students);
    } catch (error) {
        next(error);
    }
});

// @desc    Get all volunteers
// @route   GET /api/v1/admin/volunteers
// @access  Private (Admin)
router.get('/volunteers', protect, authorize('admin'), async (req, res, next) => {
    try {
        const volunteers = await Volunteer.find().populate('userId', 'email isActive createdAt');
        res.json(volunteers);
    } catch (error) {
        next(error);
    }
});

// @desc    Verify volunteer
// @route   PUT /api/v1/admin/verify-volunteer/:id
// @access  Private (Admin)
router.put('/verify-volunteer/:id', protect, authorize('admin'), async (req, res, next) => {
    try {
        const volunteer = await Volunteer.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        );
        res.json(volunteer);
    } catch (error) {
        next(error);
    }
});

// @desc    Get platform statistics
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
router.get('/stats', protect, authorize('admin'), async (req, res, next) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalVolunteers = await Volunteer.countDocuments();
        const totalRequests = await Request.countDocuments();
        const activeRequests = await Request.countDocuments({ status: { $in: ['pending', 'accepted', 'in-progress'] } });
        const completedRequests = await Request.countDocuments({ status: 'completed' });

        res.json({
            totalStudents,
            totalVolunteers,
            totalRequests,
            activeRequests,
            completedRequests
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Mark request as volunteer no-show
// @route   PUT /api/v1/admin/requests/:id/mark-no-show
// @access  Private (Admin)
router.put('/requests/:id/mark-no-show', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { markRequestAsNoShow } = require('../utils/noShowDetector');
        const result = await markRequestAsNoShow(req.params.id);

        if (!result.success) {
            return res.status(400).json({ message: result.error });
        }

        res.json({
            message: 'Request marked as no-show and volunteer penalized',
            result
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Run no-show detection
// @route   POST /api/v1/admin/run-no-show-detection
// @access  Private (Admin)
router.post('/run-no-show-detection', protect, authorize('admin'), async (req, res, next) => {
    try {
        const { detectAndHandleNoShows } = require('../utils/noShowDetector');
        const result = await detectAndHandleNoShows();

        res.json({
            message: 'No-show detection completed',
            result
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Get volunteer punishment history
// @route   GET /api/v1/admin/volunteers/:id/punishment-history
// @access  Private (Admin)
router.get('/volunteers/:id/punishment-history', protect, authorize('admin'), async (req, res, next) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        // Get all no-show requests for this volunteer
        const noShowRequests = await Request.find({
            volunteerId: req.params.id,
            status: 'volunteer_no_show'
        }).sort({ createdAt: -1 });

        res.json({
            volunteerId: req.params.id,
            noShowCount: volunteer.noShowCount,
            lastNoShowDate: volunteer.lastNoShowDate,
            suspensionEndDate: volunteer.suspensionEndDate,
            isActive: volunteer.userId?.isActive,
            noShowRequests
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

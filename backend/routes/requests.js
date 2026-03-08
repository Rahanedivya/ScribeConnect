const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Request = require('../models/Request');
const Student = require('../models/Student');
const Volunteer = require('../models/Volunteer');

// @desc    Create new request
// @route   POST /api/v1/requests
// @access  Private (Student)
router.post('/', protect, async (req, res, next) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        const request = await Request.create({
            studentId: student._id,
            ...req.body
        });
        res.status(201).json(request);
    } catch (error) {
        next(error);
    }
});

// @desc    Get request by ID
// @route   GET /api/v1/requests/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
    try {
        const request = await Request.findById(req.params.id)
            .populate('studentId', 'fullName university phone')
            .populate('volunteerId', 'fullName phone rating');
        res.json(request);
    } catch (error) {
        next(error);
    }
});

// @desc    Update request
// @route   PUT /api/v1/requests/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
    try {
        const request = await Request.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(request);
    } catch (error) {
        next(error);
    }
});

// @desc    Cancel request (student initiated)
// @route   DELETE /api/v1/requests/:id
// @access  Private (Student)
router.delete('/:id', protect, async (req, res, next) => {
    try {
        await Request.findByIdAndUpdate(req.params.id, { status: 'cancelled_by_student', volunteerId: null });
        res.json({ message: 'Request cancelled' });
    } catch (error) {
        next(error);
    }
});

// @desc    Complete request with rating and feedback
// @route   PUT /api/v1/requests/:id/complete
// @access  Private (Student)
router.put('/:id/complete', protect, async (req, res, next) => {
    try {
        const { rating, feedback } = req.body;

        // Update request status to completed and add rating/feedback
        const request = await Request.findByIdAndUpdate(
            req.params.id,
            {
                status: 'completed',
                rating,
                feedback
            },
            { new: true }
        ).populate('volunteerId', 'fullName');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Update volunteer's average rating
        if (request.volunteerId && rating) {
            const volunteer = await Volunteer.findById(request.volunteerId);
            if (volunteer) {
                const currentTotal = volunteer.rating * volunteer.totalRatings;
                volunteer.totalRatings += 1;
                volunteer.rating = (currentTotal + rating) / volunteer.totalRatings;
                await volunteer.save();
            }
        }

        res.json(request);
    } catch (error) {
        next(error);
    }
});

// @desc    Get request history (completed and cancelled)
// @route   GET /api/v1/requests/history
// @access  Private (Student)
router.get('/history', protect, async (req, res, next) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        const history = await Request.find({
            studentId: student._id,
            status: { $in: ['completed', 'cancelled_by_student', 'declined_by_volunteer'] }
        })
            .populate('volunteerId', 'fullName phone rating')
            .sort('-updatedAt');
        res.json(history);
    } catch (error) {
        next(error);
    }
});

// @desc    Rate volunteer
// @route   POST /api/v1/requests/:id/rate
// @access  Private (Student)
router.post('/:id/rate', protect, async (req, res, next) => {
    try {
        const { rating, feedback } = req.body;
        const request = await Request.findByIdAndUpdate(
            req.params.id,
            { rating, feedback },
            { new: true }
        );

        // Update volunteer rating
        const volunteer = await Volunteer.findById(request.volunteerId);
        volunteer.totalRatings += 1;
        volunteer.rating = ((volunteer.rating * (volunteer.totalRatings - 1)) + rating) / volunteer.totalRatings;
        await volunteer.save();

        res.json(request);
    } catch (error) {
        next(error);
    }
});

const fs = require('fs');
const path = require('path');
const uploadMaterials = require('../middleware/uploadMaterials');

// Delete reference material
router.delete('/:requestId/materials', protect, async (req, res, next) => {
    try {
        const { filename } = req.body;
        if (!filename) {
            return res.status(400).json({ message: 'Filename is required' });
        }

        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const request = await Request.findOne({
            _id: req.params.requestId,
            studentId: student._id
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Material paths are stored as "/uploads/materials/filename.ext"
        const materialPath = `/uploads/materials/${filename}`;

        if (!request.materials || !request.materials.includes(materialPath)) {
            return res.status(404).json({ message: 'File not found in request' });
        }

        // Remove from array
        request.materials = request.materials.filter(m => m !== materialPath);
        await request.save();

        // Delete file from filesystem
        const filePath = path.join(__dirname, '..', 'uploads', 'materials', filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json(request);
    } catch (error) {
        next(error);
    }
});

// Upload reference materials
router.post('/:requestId/materials', [protect, uploadMaterials.array('materials', 5)], async (req, res) => {
    try {

        // Find student profile for the logged-in user
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const request = await Request.findOne({
            _id: req.params.requestId,
            studentId: student._id
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Please upload at least one file' });
        }

        const materialPaths = req.files.map(file => `/uploads/materials/${file.filename}`);

        request.materials = [...(request.materials || []), ...materialPaths];
        await request.save();

        res.json(request);
    } catch (err) {
        console.error('Error uploading materials:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Request urgent support for a cancelled request
// @route   POST /api/v1/requests/:requestId/request-urgent
// @access  Private (Student)
router.post('/:requestId/request-urgent', protect, async (req, res, next) => {
    try {
        // Find student profile for the logged-in user
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const request = await Request.findOne({
            _id: req.params.requestId,
            studentId: student._id
        });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Only allow urgent request for cancelled/declined requests
        if (request.status !== 'cancelled_by_student' && request.status !== 'declined_by_volunteer') {
            return res.status(400).json({ message: 'Can only request urgent support for cancelled requests' });
        }

        // Update request to urgent
        request.urgent = true;
        request.status = 'pending'; // Reset status to pending for new urgent search
        request.volunteerId = undefined; // Clear the volunteer assignment
        await request.save();

        // TODO: Send notifications to volunteers with lastMinuteAvailable = true
        // This would involve querying volunteers and triggering real-time notifications

        res.json({
            message: 'Urgent support requested. Available volunteers will be notified.',
            request
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

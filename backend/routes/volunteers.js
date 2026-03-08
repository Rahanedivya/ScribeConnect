const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Volunteer = require('../models/Volunteer');
const Request = require('../models/Request');

// @desc    Get all available volunteers (for students to browse)
// @route   GET /api/v1/volunteers
// @access  Private (Student)
router.get('/', protect, authorize('student'), async (req, res, next) => {
    try {
        const volunteers = await Volunteer.find()
            .populate('userId', 'email')
            .select('fullName phone subjects languages availability experience rating totalRatings userId volunteerType hourlyRate city state profilePicture')
            .sort('-rating');

        // Add completed assignments count for each volunteer
        const volunteersWithStats = await Promise.all(
            volunteers.map(async (volunteer) => {
                const completedCount = await Request.countDocuments({
                    volunteerId: volunteer._id,
                    status: 'completed'
                });

                return {
                    ...volunteer.toObject(),
                    completedAssignments: completedCount
                };
            })
        );

        res.json(volunteersWithStats);
    } catch (error) {
        next(error);
    }
});

// @desc    Get volunteer profile
// @route   GET /api/v1/volunteers/profile
// @access  Private (Volunteer)
router.get('/profile', protect, authorize('volunteer'), async (req, res, next) => {
    try {
        const volunteer = await Volunteer.findOne({ userId: req.user._id });
        res.json(volunteer);
    } catch (error) {
        next(error);
    }
});

// @desc    Update volunteer profile
// @route   PUT /api/v1/volunteers/profile
// @access  Private (Volunteer)
router.put('/profile', protect, authorize('volunteer'), async (req, res, next) => {
    try {
        const volunteer = await Volunteer.findOneAndUpdate(
            { userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        res.json(volunteer);
    } catch (error) {
        next(error);
    }
});

// @desc    Get incoming requests (Matched by Location & Education)
// @route   GET /api/v1/volunteers/incoming
// @access  Private (Volunteer)
router.get('/incoming', protect, authorize('volunteer'), async (req, res, next) => {
    try {
        const volunteer = await Volunteer.findOne({ userId: req.user._id });

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer profile not found' });
        }

        // 1. Find Students in the same City & State
        // This implements the Location-based filtering (Strict)
        const Student = require('../models/Student');
        const studentsInLocation = await Student.find({
            city: { $regex: new RegExp('^' + volunteer.city + '$', 'i') }, // Case-insensitive match
            state: { $regex: new RegExp('^' + volunteer.state + '$', 'i') }
        }).select('_id');

        const studentIds = studentsInLocation.map(s => s._id);

        if (studentIds.length === 0) {
            return res.json([]); // No students in this location
        }

        // 2. Fetch Pending Requests from these Students
        let requests = await Request.find({
            status: 'pending',
            volunteerId: null,
            studentId: { $in: studentIds }
        })
            .populate('studentId', 'fullName university disabilityType specificNeeds profilePicture course currentYear city state')
            .sort('-createdAt');

        // 3. Education/Subject Matching (Soft Filter / AI Matching Score)
        // We add a 'matchScore' to prioritize relevant requests
        // Keywords: Check if request subject or student course matches volunteer subjects

        requests = requests.map(request => {
            const reqObj = request.toObject();
            let score = 0;
            const reasons = [];

            // Base score for location match (already filtered)
            score += 50;

            // Subject Matching
            // Simple keyword matching
            if (volunteer.subjects && volunteer.subjects.length > 0) {
                const requestSubject = request.subject.toLowerCase();
                const studentCourse = request.studentId.course.toLowerCase();

                const hasMatch = volunteer.subjects.some(sub => {
                    const s = sub.toLowerCase();
                    return requestSubject.includes(s) || s.includes(requestSubject) ||
                        studentCourse.includes(s) || s.includes(studentCourse);
                });

                if (hasMatch) {
                    score += 30;
                    reasons.push('Subject match');
                }
            } else {
                // If volunteer has no specific subjects, assume they are open to general requests
                score += 10;
            }

            // Language Matching (if request had language, currently Student has preferredLanguage)
            if (volunteer.languages && volunteer.languages.length > 0) {
                const studentLang = request.studentId.preferredLanguage || "";
                if (volunteer.languages.some(l => l.toLowerCase() === studentLang.toLowerCase())) {
                    score += 20;
                    reasons.push('Language match');
                }
            }

            return { ...reqObj, matchScore: score, matchReasons: reasons };
        });

        // Sort by Match Score
        requests.sort((a, b) => b.matchScore - a.matchScore);

        res.json(requests);
    } catch (error) {
        next(error);
    }
});

// @desc    Accept request
// @route   POST /api/v1/volunteers/accept/:requestId
// @access  Private (Volunteer)
router.post('/accept/:requestId', protect, authorize('volunteer'), async (req, res, next) => {
    try {
        const volunteer = await Volunteer.findOne({ userId: req.user._id });
        const request = await Request.findByIdAndUpdate(
            req.params.requestId,
            {
                volunteerId: volunteer._id,
                status: 'accepted'
            },
            { new: true }
        );
        res.json(request);
    } catch (error) {
        next(error);
    }
});

// @desc    Decline/Cancel accepted request with reason
// @route   POST /api/v1/volunteers/decline/:requestId
// @access  Private (Volunteer)
router.post('/decline/:requestId', protect, authorize('volunteer'), async (req, res, next) => {
    try {
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({ message: 'Cancellation reason is required' });
        }

        const volunteer = await Volunteer.findOne({ userId: req.user._id });
        const request = await Request.findByIdAndUpdate(
            req.params.requestId,
            {
                status: 'declined_by_volunteer',
                declineReason: reason
                // keep volunteerId for record so volunteer can still view this cancelled assignment
            },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.json(request);
    } catch (error) {
        next(error);
    }
});

// @desc    Get active assignments
// @route   GET /api/v1/volunteers/active
// @access  Private (Volunteer)
router.get('/active', protect, authorize('volunteer'), async (req, res, next) => {
    try {
        const volunteer = await Volunteer.findOne({ userId: req.user._id });
        const assignments = await Request.find({
            volunteerId: volunteer._id,
            status: { $in: ['accepted', 'in-progress', 'declined_by_volunteer'] }
        })
            .populate('studentId', 'fullName university phone profilePicture')
            .sort('examDate');
        res.json(assignments);
    } catch (error) {
        next(error);
    }
});

// @desc    Get assignment history
// @route   GET /api/v1/volunteers/history
// @access  Private (Volunteer)
router.get('/history', protect, authorize('volunteer'), async (req, res, next) => {
    try {
        const volunteer = await Volunteer.findOne({ userId: req.user._id });
        const history = await Request.find({
            volunteerId: volunteer._id,
            status: 'completed'
        })
            .populate('studentId', 'fullName university profilePicture')
            .sort('-createdAt');
        res.json(history);
    } catch (error) {
        next(error);
    }
});

// @desc    Get volunteer stats (rating, reviews, completed assignments)
// @route   GET /api/v1/volunteers/stats
// @access  Private (Volunteer)
router.get('/stats', protect, authorize('volunteer'), async (req, res, next) => {
    try {
        const volunteer = await Volunteer.findOne({ userId: req.user._id });

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer profile not found' });
        }

        // Get count of completed assignments
        const completedCount = await Request.countDocuments({
            volunteerId: volunteer._id,
            status: 'completed'
        });

        res.json({
            averageRating: volunteer.rating || 0,
            totalReviews: volunteer.totalRatings || 0,
            completedAssignments: completedCount
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Upload volunteer profile photo
// @route   POST /api/v1/volunteers/profile/photo
// @access  Private (Volunteer)
router.post('/profile/photo', protect, authorize('volunteer'), upload.single('photo'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a photo' });
        }

        // Construct the photo URL
        const photoUrl = `/uploads/profiles/${req.file.filename}`;

        // Update volunteer profile with photo URL
        const volunteer = await Volunteer.findOneAndUpdate(
            { userId: req.user._id },
            { profilePicture: photoUrl },
            { new: true, runValidators: true }
        );

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer profile not found' });
        }

        res.json({
            message: 'Photo uploaded successfully',
            profilePicture: photoUrl,
            volunteer
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Toggle last-minute availability
// @route   POST /api/v1/volunteers/toggle-last-minute
// @access  Private (Volunteer)
router.post('/toggle-last-minute', protect, authorize('volunteer'), async (req, res, next) => {
    try {
        const { available } = req.body;

        if (typeof available !== 'boolean') {
            return res.status(400).json({ message: 'Available must be a boolean' });
        }

        const volunteer = await Volunteer.findOneAndUpdate(
            { userId: req.user._id },
            { lastMinuteAvailable: available },
            { new: true, runValidators: true }
        );

        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer profile not found' });
        }

        res.json({
            message: `Last-minute availability ${available ? 'enabled' : 'disabled'}`,
            lastMinuteAvailable: volunteer.lastMinuteAvailable,
            volunteer
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Get urgent requests for volunteer
// @route   GET /api/v1/volunteers/urgent-requests
// @access  Private (Volunteer)
router.get('/urgent-requests', protect, authorize('volunteer'), async (req, res, next) => {
    try {
        // Get urgent requests that haven't been assigned yet
        const urgentRequests = await Request.find({
            urgent: true,
            volunteerId: { $exists: false }
        })
            .populate('studentId', 'name email subject location availableTime')
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            count: urgentRequests.length,
            requests: urgentRequests
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Delete/Remove a request from volunteer assignments
// @route   DELETE /api/v1/volunteers/requests/:requestId
// @access  Private (Volunteer)
router.delete('/requests/:requestId', protect, authorize('volunteer'), async (req, res, next) => {
    try {
        const request = await Request.findById(req.params.requestId);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Verify the volunteer is assigned to this request
        const volunteer = await Volunteer.findOne({ userId: req.user._id });
        if (request.volunteerId.toString() !== volunteer._id.toString()) {
            return res.status(403).json({ message: 'You are not assigned to this request' });
        }

        // Delete the request
        await Request.findByIdAndDelete(req.params.requestId);

        res.json({
            message: 'Assignment deleted successfully',
            deletedId: req.params.requestId
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

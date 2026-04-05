const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Volunteer = require('../models/Volunteer');
const Request = require('../models/Request');
const ScribeEligibilityValidator = require('../utils/scribeEligibilityValidator');

// @desc    Get all available volunteers (for students to browse)
// @route   GET /api/v1/volunteers
// @access  Private (Student)
router.get('/', protect, authorize('student'), async (req, res, next) => {
    try {
        // Get current student info for eligibility checking
        const Student = require('../models/Student');
        const student = await Student.findOne({ userId: req.user._id });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const volunteers = await Volunteer.find()
            .populate('userId', 'email')
            .select('fullName phone subjects languages availability experience rating totalRatings userId volunteerType hourlyRate city state profilePicture educationLevel subjectExpertise availabilityStatus')
            .sort('-rating');

        // Add completed assignments count and eligibility status for each volunteer
        const volunteersWithStats = await Promise.all(
            volunteers.map(async (volunteer) => {
                const completedCount = await Request.countDocuments({
                    volunteerId: volunteer._id,
                    status: 'completed'
                });

                // Check eligibility for scribe requests (generic check without specific subject)
                const eligibilityStatus = ScribeEligibilityValidator.getEligibilityStatus(
                    volunteer,
                    student,
                    '' // Empty subject for general availability check
                );

                return {
                    ...volunteer.toObject(),
                    completedAssignments: completedCount,
                    eligibilityStatus: eligibilityStatus.status,
                    eligibilityMessage: eligibilityStatus.message,
                    canSendRequest: eligibilityStatus.canSendRequest
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
        })
            .select('_id');

        const studentIds = studentsInLocation.map(s => s._id);

        if (studentIds.length === 0) {
            return res.json([]); // No students in this location
        }

        // 2. Fetch ALL Requests from these Students (both active and past)
        let allRequests = await Request.find({
            status: { $in: ['pending', 'accepted', 'rejected'] },
            studentId: { $in: studentIds }
        })
            .populate('studentId', 'fullName university disabilityType specificNeeds profilePicture course currentYear city state educationLevel')
            .populate('volunteerId', 'fullName')
            .sort('-createdAt');

        // 3. Categorize requests based on exam date
        const activeRequests = [];
        const pastRequests = [];

        // enhance each request: compute daysRemaining and automatically flag urgent if near
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today

        allRequests = await Promise.all(allRequests.map(async request => {
            const reqObj = request.toObject();

            const exam = new Date(reqObj.examDate);
            const examDateOnly = new Date(exam.getFullYear(), exam.getMonth(), exam.getDate()); // Start of exam day
            const diffDays = Math.ceil((exam - now) / (1000 * 60 * 60 * 24));
            reqObj.daysRemaining = diffDays;

            // Determine if this is a past request
            const isPastRequest = examDateOnly < today;

            // if exam date has passed we clear urgent status
            if (diffDays < 0 && reqObj.urgent) {
                // optional: clear urgent in db
                await Request.findByIdAndUpdate(reqObj._id, { urgent: false });
                reqObj.urgent = false;
            }
            // if exam is within 3 days mark urgent (only for active requests)
            if (diffDays >= 0 && diffDays <= 3 && !reqObj.urgent && !isPastRequest) {
                await Request.findByIdAndUpdate(reqObj._id, { urgent: true });
                reqObj.urgent = true;
            }

            reqObj.isPastRequest = isPastRequest;
            return reqObj;
        }));

        // 4. Separate active and past requests
        allRequests.forEach(request => {
            if (request.isPastRequest) {
                pastRequests.push(request);
            } else {
                activeRequests.push(request);
            }
        });

        // 5. Scribe Eligibility Filtering (only for active requests)
        // Only show active requests where volunteer is eligible based on education level and subject expertise.
        // Accepted requests can still be visible if they are marked OPEN.
        const ScribeEligibilityValidator = require('../utils/scribeEligibilityValidator');

        const filteredActiveRequests = activeRequests.filter(request => {
            const isAssignedToCurrentVolunteer = request.volunteerId && request.volunteerId.toString() === volunteer._id.toString();

            // Keep own accepted requests in the volunteer's view. Hide already assigned requests unless they are OPEN and not assigned to the current volunteer.
            if (request.status === 'accepted' && request.volunteerId && !isAssignedToCurrentVolunteer) {
                return request.visibilityMode === 'OPEN';
            }

            // Check eligibility for pending requests and any open accepted requests.
            const eligibility = ScribeEligibilityValidator.validateEligibility(
                request.studentId,
                volunteer,
                request.subject
            );

            return eligibility.eligible;
        });

        // 6. Add eligibility status for active requests display
        const activeRequestsWithEligibility = filteredActiveRequests.map(request => {
            const eligibilityStatus = ScribeEligibilityValidator.getEligibilityStatus(
                volunteer,
                request.studentId,
                request.subject
            );

            return {
                ...request,
                eligibilityStatus: eligibilityStatus.status,
                eligibilityMessage: eligibilityStatus.message,
                canAccept: eligibilityStatus.canSendRequest
            };
        });

        // 7. For past requests, just add basic info (no eligibility checking needed)
        const pastRequestsWithInfo = pastRequests.map(request => ({
            ...request,
            eligibilityStatus: 'past',
            eligibilityMessage: 'This request has expired',
            canAccept: false
        }));

        res.json({
            activeRequests: activeRequestsWithEligibility,
            pastRequests: pastRequestsWithInfo
        });
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
        const request = await Request.findById(req.params.requestId)
            .populate({
                path: 'studentId',
                select: 'educationLevel'
            });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Validate eligibility before accepting
        const eligibilityCheck = ScribeEligibilityValidator.validateRequestAcceptance(
            volunteer,
            request.studentId,
            request.subject
        );

        if (!eligibilityCheck.canAccept) {
            return res.status(403).json({
                message: 'You are not eligible to accept this request',
                reason: eligibilityCheck.message
            });
        }

        // Use atomic update to prevent race conditions
        const updatedRequest = await Request.findOneAndUpdate(
            {
                _id: req.params.requestId,
                status: 'pending', // Only accept if still pending
                volunteerId: null // Only accept if not already assigned
            },
            {
                volunteerId: volunteer._id,
                acceptedBy: volunteer._id,
                acceptedAt: new Date(),
                visibilityMode: 'PRIVATE',
                status: 'accepted'
            },
            {
                new: true,
                runValidators: true
            }
        ).populate('studentId', 'fullName university phone');

        if (!updatedRequest) {
            return res.status(409).json({
                message: 'Request has already been accepted by another volunteer'
            });
        }

        // Create chat session for this assignment so the assigned volunteer and student can communicate.
        const ChatSession = require('../models/ChatSession');
        const chatSession = await ChatSession.create({
            requestId: updatedRequest._id,
            studentId: updatedRequest.studentId._id,
            volunteerId: volunteer._id,
            messages: []
        });

        updatedRequest.chatSessionId = chatSession._id;
        await updatedRequest.save();

        res.json(updatedRequest);
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
        let assignments = await Request.find({
            volunteerId: volunteer._id,
            status: { $in: ['accepted', 'in-progress', 'declined_by_volunteer'] }
        })
            .populate({
                path: 'studentId',
                select: 'fullName university phone profilePicture'
            })
            .sort('examDate');

        const now = new Date();
        assignments = assignments.map(a => {
            const obj = a.toObject();
            if (obj.examDate) {
                const diffDays = Math.ceil((new Date(obj.examDate) - now) / (1000 * 60 * 60 * 24));
                obj.daysRemaining = diffDays;
                if (diffDays <= 3 && diffDays >= 0) obj.urgent = true;
                if (diffDays < 0) obj.urgent = false;
            }
            return obj;
        });

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
            .populate({
                path: 'studentId',
                select: 'fullName university profilePicture'
            })
            .sort('-createdAt');

        const sanitizedHistory = history.map((entry) => {
            return entry.toObject();
        });

        res.json(sanitizedHistory);
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
            completedAssignments: completedCount,
            ignoredRequestsCount: volunteer.ignoredRequestsCount || 0
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
        const now = new Date();
        const threeDaysFromNow = new Date(now);
        threeDaysFromNow.setDate(now.getDate() + 3);

        // Get urgent or soon-to-be-urgent requests that haven't been assigned yet
        let urgentRequests = await Request.find({
            volunteerId: { $exists: false },
            status: 'pending',
            $or: [
                { urgent: true },
                { examDate: { $gte: now, $lte: threeDaysFromNow } }
            ]
        })
            .populate('studentId', 'name email subject location availableTime')
            .sort({ createdAt: -1 })
            .lean();

        // augment daysRemaining and normalize urgent flag
        urgentRequests = urgentRequests.map(r => {
            const exam = new Date(r.examDate);
            const diffDays = Math.ceil((exam - now) / (1000 * 60 * 60 * 24));
            r.daysRemaining = diffDays;
            if (diffDays < 0) {
                r.urgent = false;
            } else if (diffDays <= 3) {
                r.urgent = true;
            }
            return r;
        });

        // optionally persist urgent flag for those newly marked
        urgentRequests.forEach(r => {
            if (r.urgent) {
                Request.findByIdAndUpdate(r._id, { urgent: true }).exec();
            }
        });

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

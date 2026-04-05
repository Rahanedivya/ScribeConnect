/**
 * AI-Enhanced Matching Controller
 * Provides endpoints for intelligent volunteer matching
 */

const Request = require('../models/Request');
const Student = require('../models/Student');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const AIMatchingEngine = require('../utils/aiMatchingEngine');

/**
 * GET /api/v1/matching/smart-volunteers
 * Get AI-ranked volunteers for a specific request
 * Query params: subject, examDate, examTime, duration, city
 */
exports.getSmartVolunteerMatches = async (req, res) => {
    try {
        const studentId = req.user._id;
        const student = await Student.findOne({ userId: studentId });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        const { subject, examDate, examTime, duration } = req.query;

        if (!subject || !examDate || !examTime) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: subject, examDate, examTime'
            });
        }

        const requestData = {
            subject,
            examDate,
            examTime,
            duration: duration || '2 hours'
        };

        // Get AI-ranked matches
        const rankedVolunteers = await AIMatchingEngine.getSmartMatches(
            requestData,
            student.city,
            student.disabilityType,
            student // Pass student object for eligibility validation
        );

        res.status(200).json({
            success: true,
            message: `Found ${rankedVolunteers.length} suitable volunteers`,
            studentCity: student.city,
            studentDisability: student.disabilityType,
            volunteers: rankedVolunteers,
            totalMatches: rankedVolunteers.length
        });
    } catch (error) {
        console.error('Error in smart volunteer matching:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch smart volunteer matches',
            error: error.message
        });
    }
};

/**
 * GET /api/v1/matching/top-recommendations
 * Get top 5 volunteer recommendations for a request
 */
exports.getTopRecommendations = async (req, res) => {
    try {
        const studentId = req.user._id;
        const student = await Student.findOne({ userId: studentId });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        const { subject, examDate, examTime, duration, limit } = req.query;

        if (!subject || !examDate || !examTime) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: subject, examDate, examTime'
            });
        }

        const requestData = {
            subject,
            examDate,
            examTime,
            duration: duration || '2 hours'
        };

        const topMatches = await AIMatchingEngine.getTopRecommendations(
            requestData,
            student.city,
            student.disabilityType,
            parseInt(limit) || 5,
            student // Pass student object for eligibility validation
        );

        res.status(200).json({
            success: true,
            message: `Top ${topMatches.length} recommendations`,
            recommendations: topMatches
        });
    } catch (error) {
        console.error('Error getting top recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recommendations'
        });
    }
};

/**
 * POST /api/v1/matching/auto-allocate
 * Automatically allocate best-matched volunteer to a request
 */
exports.autoAllocateVolunteer = async (req, res) => {
    try {
        const studentId = req.user._id;
        const student = await Student.findOne({ userId: studentId });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        const { requestId } = req.body;

        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Get best-matched volunteer
        const bestMatch = await AIMatchingEngine.getRecommendedVolunteer(
            {
                subject: request.subject,
                examDate: request.examDate,
                examTime: request.examTime,
                duration: request.duration
            },
            student.city,
            student.disabilityType,
            student // Pass student object for eligibility validation
        );

        if (!bestMatch) {
            return res.status(404).json({
                success: false,
                message: 'No suitable volunteers found for this request'
            });
        }

        // Update request with best match
        request.volunteerId = bestMatch._id;
        request.status = 'accepted';
        await request.save();

        // Notify volunteer
        // TODO: Add notification logic here

        res.status(200).json({
            success: true,
            message: 'Volunteer automatically allocated based on AI matching',
            request: request,
            allocatedVolunteer: {
                _id: bestMatch._id,
                fullName: bestMatch.fullName,
                rating: bestMatch.rating,
                matchScore: bestMatch.totalScore,
                matchPercentage: bestMatch.matchPercentage
            }
        });
    } catch (error) {
        console.error('Error in auto-allocation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to auto-allocate volunteer'
        });
    }
};

/**
 * GET /api/v1/matching/volunteer-compatibility
 * Get compatibility score between a student and specific volunteer
 */
exports.getVolunteerCompatibility = async (req, res) => {
    try {
        const studentId = req.user._id;
        const student = await Student.findOne({ userId: studentId });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        const { volunteerId, subject, examDate, examTime } = req.query;

        if (!volunteerId || !subject || !examDate || !examTime) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const compatibilityScore = await AIMatchingEngine.calculatePerformanceScore(
            volunteerId,
            {
                subject,
                examDate,
                examTime,
                duration: '2 hours'
            },
            student.city
        );

        const volunteer = await Volunteer.findById(volunteerId);

        res.status(200).json({
            success: true,
            volunteer: {
                _id: volunteer._id,
                fullName: volunteer.fullName,
                rating: volunteer.rating,
                subjects: volunteer.subjects
            },
            compatibilityScore: compatibilityScore,
            message: `This volunteer is ${compatibilityScore}% compatible with your request`
        });
    } catch (error) {
        console.error('Error calculating compatibility:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate compatibility score'
        });
    }
};

/**
 * GET /api/v1/matching/analytics
 * Get analytics about matching quality and volunteer distribution
 */
exports.getMatchingAnalytics = async (req, res) => {
    try {
        const completedRequests = await Request.find({ status: 'completed' });
        const lastMinuteRequests = await Request.find({ requestType: 'LAST_MINUTE' });

        if (completedRequests.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No completed requests yet',
                analytics: {
                    totalCompletedRequests: 0,
                    averageRating: 0,
                    matchSuccessRate: 0,
                    lastMinuteStats: { total: 0, completed: 0 }
                }
            });
        }

        // Calculate success metrics
        const avgRating = completedRequests.reduce((sum, r) => sum + (r.rating || 0), 0) / completedRequests.length;
        const completedLastMinute = lastMinuteRequests.filter(r => r.status === 'completed').length;
        const matchSuccessRate = (completedRequests.length / (completedRequests.length + lastMinuteRequests.filter(r => r.status !== 'completed').length)) * 100 || 0;

        res.status(200).json({
            success: true,
            analytics: {
                totalCompletedRequests: completedRequests.length,
                averageRating: parseFloat(avgRating.toFixed(2)),
                matchSuccessRate: parseFloat(matchSuccessRate.toFixed(2)),
                lastMinuteStats: {
                    total: lastMinuteRequests.length,
                    completed: completedLastMinute,
                    completionRate: ((completedLastMinute / lastMinuteRequests.length) * 100).toFixed(2) + '%'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching matching analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics'
        });
    }
};

module.exports = exports;

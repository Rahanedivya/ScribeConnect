const Volunteer = require('../models/Volunteer');
const Request = require('../models/Request');
const Student = require('../models/Student');
const User = require('../models/User');

// Get all volunteers available for last minute allocation in a specific city
exports.getAvailableVolunteers = async (req, res) => {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({
                success: false,
                message: 'City parameter is required'
            });
        }

        console.log(`[DEBUG] Searching for volunteers in city: "${city}"`);

        // Find all volunteers who are:
        // 1. Last minute available
        // 2. In the same city as the student (case-insensitive)
        const volunteers = await Volunteer.find({
            lastMinuteAvailable: true,
            city: { $regex: `^${city}$`, $options: 'i' }  // Case-insensitive search
        }).select('-availability');

        console.log(`[DEBUG] Found ${volunteers.length} volunteers available in ${city}`);
        
        // If no volunteers found and city exists, log why
        if (volunteers.length === 0) {
            const allVolunteers = await Volunteer.find({}).select('fullName city lastMinuteAvailable isVerified');
            console.log(`[DEBUG] All volunteers in database: ${JSON.stringify(allVolunteers)}`);
        }

        // Get ratings and other info
        const volunteersWithStats = volunteers.map(vol => ({
            _id: vol._id,
            fullName: vol.fullName,
            city: vol.city,
            rating: vol.rating,
            profilePicture: vol.profilePicture,
            totalAssignments: vol.totalAssignments,
            subjects: vol.subjects,
            languages: vol.languages,
            lastMinuteHero: vol.lastMinuteHero,
            lastMinuteCount: vol.lastMinuteCount
        }));

        res.status(200).json({
            success: true,
            volunteers: volunteersWithStats,
            debug: {
                searchCity: city,
                volunteersFound: volunteers.length
            }
        });
    } catch (error) {
        console.error('Error getting available volunteers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available volunteers'
        });
    }
};

// Send last minute request from student to volunteer
exports.sendLastMinuteRequest = async (req, res) => {
    try {
        const { volunteerId, subject, examType, examDate, examTime, duration, requirements } = req.body;
        const studentId = req.user._id;

        // Verify student exists
        const student = await Student.findOne({ userId: studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found'
            });
        }

        //  Verify volunteer exists and is available
        const volunteer = await Volunteer.findById(volunteerId);
        if (!volunteer || !volunteer.lastMinuteAvailable) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not available for last minute requests'
            });
        }

        // Create a new last minute request
        const newRequest = new Request({
            studentId: student._id,
            volunteerId: null,  // Initially no volunteer assigned
            subject,
            examType,
            examDate: new Date(examDate),
            examTime,
            duration,
            requirements,
            requestType: 'LAST_MINUTE',
            status: 'pending'
        });

        await newRequest.save();

        // Notify the volunteer (in a real system)
        // For now, we'll just send it to the pending list

        res.status(201).json({
            success: true,
            message: 'Last minute request sent successfully',
            request: newRequest
        });
    } catch (error) {
        console.error('Error sending last minute request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send last minute request'
        });
    }
};

// Get student's last minute requests
exports.getStudentLastMinuteRequests = async (req, res) => {
    try {
        const studentId = req.user._id;
        const student = await Student.findOne({ userId: studentId });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const requests = await Request.find({
            studentId: student._id,
            requestType: 'LAST_MINUTE'
        }).populate('volunteerId', 'fullName rating');

        res.status(200).json({
            success: true,
            requests
        });
    } catch (error) {
        console.error('Error fetching student last minute requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch last minute requests'
        });
    }
};

// Get volunteer's last minute requests
exports.getVolunteerLastMinuteRequests = async (req, res) => {
    try {
        const volunteerId = req.user._id;
        const volunteer = await Volunteer.findOne({ userId: volunteerId });

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        // Get pending last minute requests
        const requests = await Request.find({
            requestType: 'LAST_MINUTE',
            status: { $in: ['pending', 'accepted'] }
        }).populate('studentId', 'fullName phone city state university profilePicture');

        // Filter for this volunteer's accepted requests + pending ones
        const filteredRequests = requests.filter(req => 
            req.status === 'pending' || req.volunteerId?.toString() === volunteer._id.toString()
        );

        res.status(200).json({
            success: true,
            requests: filteredRequests
        });
    } catch (error) {
        console.error('Error fetching volunteer last minute requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch last minute requests'
        });
    }
};

// Accept last minute request
exports.acceptLastMinuteRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const volunteerId = req.user._id;

        const volunteer = await Volunteer.findOne({ userId: volunteerId });
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        const request = await Request.findById(requestId);
        if (!request || request.requestType !== 'LAST_MINUTE') {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This request is no longer available'
            });
        }

        // Update request status
        request.volunteerId = volunteer._id;
        request.status = 'accepted';
        await request.save();

        // Increment volunteer's last minute count
        volunteer.lastMinuteCount = (volunteer.lastMinuteCount || 0) + 1;

        // Check if volunteer should get "Last Minute Hero" badge
        if (volunteer.lastMinuteCount >= 5) {
            volunteer.lastMinuteHero = true;
        }

        await volunteer.save();

        res.status(200).json({
            success: true,
            message: 'Request accepted successfully',
            request
        });
    } catch (error) {
        console.error('Error accepting last minute request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept request'
        });
    }
};

// Reject/Decline last minute request
exports.rejectLastMinuteRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { reason } = req.body;

        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        request.status = 'declined_by_volunteer';
        request.declineReason = reason || 'No reason provided';
        await request.save();

        res.status(200).json({
            success: true,
            message: 'Request declined successfully'
        });
    } catch (error) {
        console.error('Error rejecting last minute request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject request'
        });
    }
};

// Update volunteer's last minute availability
exports.updateLastMinuteAvailability = async (req, res) => {
    try {
        const { lastMinuteAvailable } = req.body;
        const volunteerId = req.user._id;

        const volunteer = await Volunteer.findOne({ userId: volunteerId });
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        volunteer.lastMinuteAvailable = lastMinuteAvailable;
        await volunteer.save();

        res.status(200).json({
            success: true,
            message: 'Last minute availability updated',
            volunteer: {
                lastMinuteAvailable: volunteer.lastMinuteAvailable
            }
        });
    } catch (error) {
        console.error('Error updating last minute availability:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update availability'
        });
    }
};

// Get volunteer's last minute stats
exports.getVolunteerLastMinuteStats = async (req, res) => {
    try {
        const volunteerId = req.user._id;

        const volunteer = await Volunteer.findOne({ userId: volunteerId });
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        res.status(200).json({
            success: true,
            stats: {
                lastMinuteCount: volunteer.lastMinuteCount || 0,
                isHero: volunteer.lastMinuteHero || false,
                lastMinuteAvailable: volunteer.lastMinuteAvailable || false
            }
        });
    } catch (error) {
        console.error('Error fetching last minute stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats'
        });
    }
};

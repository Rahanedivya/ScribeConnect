const express = require('express');
const router = express.Router();
const lastMinuteController = require('../controllers/lastMinuteController');
const { protect } = require('../middleware/auth');

// Get available volunteers for last minute allocation
router.get('/available-volunteers', protect, lastMinuteController.getAvailableVolunteers);

// Send last minute request from student to volunteer
router.post('/send-request', protect, lastMinuteController.sendLastMinuteRequest);

// Get student's last minute requests
router.get('/student/requests', protect, lastMinuteController.getStudentLastMinuteRequests);

// Get volunteer's last minute requests
router.get('/volunteer/requests', protect, lastMinuteController.getVolunteerLastMinuteRequests);

// Accept last minute request
router.put('/volunteer/accept/:requestId', protect, lastMinuteController.acceptLastMinuteRequest);

// Reject/Decline last minute request
router.put('/volunteer/reject/:requestId', protect, lastMinuteController.rejectLastMinuteRequest);

// Update volunteer's last minute availability
router.put('/volunteer/availability', protect, lastMinuteController.updateLastMinuteAvailability);

// Get volunteer's last minute stats
router.get('/volunteer/stats', protect, lastMinuteController.getVolunteerLastMinuteStats);

module.exports = router;

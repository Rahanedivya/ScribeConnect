const express = require('express');
const router = express.Router();
const aiMatchingController = require('../controllers/aiMatchingController');
const { protect } = require('../middleware/auth');

/**
 * AI-Powered Matching Routes
 * All routes require authentication
 */

// Get AI-ranked volunteers for a request
// GET /api/v1/matching/smart-volunteers?subject=Math&examDate=2024-03-15&examTime=09:00
router.get('/smart-volunteers', protect, aiMatchingController.getSmartVolunteerMatches);

// Get top 5 volunteer recommendations
// GET /api/v1/matching/top-recommendations?subject=Math&examDate=2024-03-15&examTime=09:00&limit=5
router.get('/top-recommendations', protect, aiMatchingController.getTopRecommendations);

// Automatically allocate best-matched volunteer to a request
// POST /api/v1/matching/auto-allocate
// Body: { requestId: "..." }
router.post('/auto-allocate', protect, aiMatchingController.autoAllocateVolunteer);

// Get compatibility score between student and volunteer
// GET /api/v1/matching/volunteer-compatibility?volunteerId=...&subject=...&examDate=...&examTime=...
router.get('/volunteer-compatibility', protect, aiMatchingController.getVolunteerCompatibility);

// Get matching analytics and statistics
// GET /api/v1/matching/analytics
router.get('/analytics', protect, aiMatchingController.getMatchingAnalytics);

module.exports = router;

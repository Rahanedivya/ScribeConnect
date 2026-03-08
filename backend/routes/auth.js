const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
    validateRegistration,
    validateLogin,
    validate
} = require('../utils/validators');
const {
    registerStudent,
    registerVolunteer,
    login,
    getMe
} = require('../controllers/authController');

router.post('/register/student', authLimiter, validateRegistration, validate, registerStudent);
router.post('/register/volunteer', authLimiter, validateRegistration, validate, registerVolunteer);
router.post('/login', authLimiter, validateLogin, validate, login);
router.get('/me', protect, getMe);

module.exports = router;

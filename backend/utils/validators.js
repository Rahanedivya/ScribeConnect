const { body, validationResult } = require('express-validator');

// Validation rules
const validateRegistration = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateLogin = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

const validateStudentProfile = [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('phone').isMobilePhone().withMessage('Please enter a valid phone number'),
    body('university').notEmpty().withMessage('University is required'),
    body('course').notEmpty().withMessage('Course is required'),
    body('disabilityType').notEmpty().withMessage('Disability type is required'),
    body('specificNeeds').notEmpty().withMessage('Specific needs are required')
];

const validateVolunteerProfile = [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('phone').isMobilePhone().withMessage('Please enter a valid phone number'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required')
];

const validateRequest = [
    body('subject').notEmpty().withMessage('Subject is required'),
    body('examType').notEmpty().withMessage('Exam type is required'),
    body('examDate').isISO8601().withMessage('Valid exam date is required'),
    body('examTime').notEmpty().withMessage('Exam time is required'),
    body('duration').notEmpty().withMessage('Duration is required'),
    body('requirements').notEmpty().withMessage('Requirements are required')
];

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateStudentProfile,
    validateVolunteerProfile,
    validateRequest,
    validate
};

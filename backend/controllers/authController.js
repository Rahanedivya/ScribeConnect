const User = require('../models/User');
const Student = require('../models/Student');
const Volunteer = require('../models/Volunteer');
const generateToken = require('../utils/generateToken');

// @desc    Register student
// @route   POST /api/v1/auth/register/student
// @access  Public
const registerStudent = async (req, res, next) => {
    try {
        const { email, password, ...studentData } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            email,
            password,
            role: 'student'
        });

        // Create student profile
        const student = await Student.create({
            userId: user._id,
            ...studentData
        });

        res.status(201).json({
            _id: user._id,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            profile: student
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Register volunteer
// @route   POST /api/v1/auth/register/volunteer
// @access  Public
const registerVolunteer = async (req, res, next) => {
    try {
        const { email, password, ...volunteerData } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            email,
            password,
            role: 'volunteer'
        });

        const volunteer = await Volunteer.create({
            userId: user._id,
            ...volunteerData
        });

        res.status(201).json({
            _id: user._id,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            profile: volunteer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated' });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Get profile based on role
        let profile;
        if (user.role === 'student') {
            profile = await Student.findOne({ userId: user._id });
        } else if (user.role === 'volunteer') {
            profile = await Volunteer.findOne({ userId: user._id });
        }

        res.json({
            _id: user._id,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            profile
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        let profile;
        if (req.user.role === 'student') {
            profile = await Student.findOne({ userId: req.user._id });
        } else if (req.user.role === 'volunteer') {
            profile = await Volunteer.findOne({ userId: req.user._id });
        }

        res.json({
            _id: req.user._id,
            email: req.user.email,
            role: req.user.role,
            profile
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerStudent,
    registerVolunteer,
    login,
    getMe
};

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Student = require('../models/Student');
const Request = require('../models/Request');

// @desc    Get student profile
// @route   GET /api/v1/students/profile
// @access  Private (Student)
router.get('/profile', protect, authorize('student'), async (req, res, next) => {
    try {
        console.log('🔍 Fetching profile for user ID:', req.user._id);
        const student = await Student.findOne({ userId: req.user._id });
        console.log('📊 Student found:', student ? 'YES' : 'NO');
        if (student) {
            console.log('✅ Student data:', { fullName: student.fullName, email: req.user.email });
        } else {
            console.log('❌ No student record found for userId:', req.user._id);
            // Check if any student records exist
            const allStudents = await Student.find({}).limit(5);
            console.log('📋 Total students in DB:', await Student.countDocuments());
            console.log('📋 Sample student userIds:', allStudents.map(s => s.userId.toString()));
        }
        res.json(student);
    } catch (error) {
        console.error('❌ Error fetching profile:', error);
        next(error);
    }
});

// @desc    Update student profile
// @route   PUT /api/v1/students/profile
// @access  Private (Student)
router.put('/profile', protect, authorize('student'), async (req, res, next) => {
    try {
        console.log('🔄 UPDATE PROFILE REQUEST');
        console.log('👤 User ID:', req.user._id);
        console.log('📝 Request body:', JSON.stringify(req.body, null, 2));

        // Find the existing student first
        const existingStudent = await Student.findOne({ userId: req.user._id });
        console.log('📊 Existing student found:', existingStudent ? 'YES' : 'NO');
        if (existingStudent) {
            console.log('📋 Current data:', {
                fullName: existingStudent.fullName,
                phone: existingStudent.phone,
                university: existingStudent.university,
                course: existingStudent.course
            });
        }

        const student = await Student.findOneAndUpdate(
            { userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        console.log('✅ Update result:', student ? 'SUCCESS' : 'FAILED');
        if (student) {
            console.log('📋 Updated data:', {
                fullName: student.fullName,
                phone: student.phone,
                university: student.university,
                course: student.course
            });
        }

        res.json(student);
    } catch (error) {
        console.error('❌ Update error:', error);
        next(error);
    }
});

// @desc    Create new scribe request
// @route   POST /api/v1/students/requests
// @access  Private (Student)
router.post('/requests', protect, authorize('student'), async (req, res, next) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const request = await Request.create({
            studentId: student._id,
            ...req.body
        });

        // Populate the created request
        const populatedRequest = await Request.findById(request._id)
            .populate('studentId', 'fullName university phone');

        res.status(201).json(populatedRequest);
    } catch (error) {
        next(error);
    }
});

// @desc    Get student's requests
// @route   GET /api/v1/students/requests
// @access  Private (Student)
router.get('/requests', protect, authorize('student'), async (req, res, next) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const requests = await Request.find({ studentId: student._id })
            .populate('volunteerId', 'fullName phone rating')
            .sort('-createdAt');

        res.json(requests);
    } catch (error) {
        console.error('Error fetching student requests:', error);
        next(error);
    }
});

// @desc    Get student's request history
// @route   GET /api/v1/students/history
// @access  Private (Student)
router.get('/history', protect, authorize('student'), async (req, res, next) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        const history = await Request.find({
            studentId: student._id,
            status: { $in: ['completed', 'cancelled'] }
        })
            .populate('volunteerId', 'fullName rating')
            .sort('-createdAt');
        res.json(history);
    } catch (error) {
        next(error);
    }
});

// @desc    Upload student profile photo
// @route   POST /api/v1/students/profile/photo
// @access  Private (Student)
router.post('/profile/photo', protect, authorize('student'), upload.single('photo'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a photo' });
        }

        // Construct the photo URL
        const photoUrl = `/uploads/profiles/${req.file.filename}`;

        // Update student profile with photo URL
        const student = await Student.findOneAndUpdate(
            { userId: req.user._id },
            { profilePicture: photoUrl },
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        res.json({
            message: 'Photo uploaded successfully',
            profilePicture: photoUrl,
            student
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

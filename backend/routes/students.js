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

        // Validate required fields
        const { subject, examType, examDate, examTime, duration, requirements } = req.body;
        
        if (!subject || !examType || !examDate || !examTime || !duration || !requirements) {
            return res.status(400).json({ 
                message: 'Missing required fields: subject, examType, examDate, examTime, duration, requirements' 
            });
        }

        // Validate exam date is in the future
        const examDateTime = new Date(examDate);
        if (examDateTime < new Date()) {
            return res.status(400).json({ 
                message: 'Exam date must be in the future' 
            });
        }

        // determine if the new request should be marked urgent based on exam date
        const payload = {
            studentId: student._id,
            ...req.body,
            // Store student's education level with the request for reference
            student_education_level: student.educationLevel,
            language: student.preferredLanguage,
            location: `${student.city}, ${student.state}`
        };
        
        if (payload.examDate) {
            const now = new Date();
            const exam = new Date(payload.examDate);
            const days = Math.ceil((exam - now) / (1000 * 60 * 60 * 24));
            if (days <= 3) {
                payload.urgent = true;
            }
        }

        const request = await Request.create(payload);

        // Populate the created request
        const populatedRequest = await Request.findById(request._id)
            .populate('studentId', 'fullName university phone educationLevel stream');

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

        let requests = await Request.find({ studentId: student._id })
            .populate({
                path: 'volunteerId',
                select: 'fullName phone rating'
            })
            .sort('-createdAt');

        const sanitizedRequests = requests.map(r => {
            const obj = r.toObject();
            obj.language = obj.language || student.preferredLanguage;
            obj.location = obj.location || `${student.city}, ${student.state}`;
            return obj;
        });

        const now = new Date();
        const categorizedRequests = {
            active: [],
            expired: [],
            completed: [],
            cancelled: []
        };

        sanitizedRequests.forEach(obj => {
            if (obj.examDate) {
                const diffDays = Math.ceil((new Date(obj.examDate) - now) / (1000 * 60 * 60 * 24));
                obj.daysRemaining = diffDays;
                if (diffDays <= 3 && diffDays >= 0) obj.urgent = true;
                if (diffDays < 0 && obj.status === 'pending') {
                    obj.status = 'expired'; // Mark as expired for display
                }
            }

            // Categorize requests
            if (obj.status === 'expired' || (obj.status === 'pending' && obj.daysRemaining < 0)) {
                categorizedRequests.expired.push(obj);
            } else if (['completed', 'cancelled_by_student', 'declined_by_volunteer'].includes(obj.status)) {
                categorizedRequests.completed.push(obj);
            } else if (['cancelled', 'volunteer_no_show'].includes(obj.status)) {
                categorizedRequests.cancelled.push(obj);
            } else {
                categorizedRequests.active.push(obj);
            }
        });

        res.json(categorizedRequests);
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
            .populate({
                path: 'volunteerId',
                select: 'fullName rating userId',
                populate: { path: 'userId', select: 'isActive' }
            })
            .sort('-createdAt');

        const sanitizedHistory = history.map(entry => {
            const obj = entry.toObject();
            if (obj.volunteerId && obj.volunteerId.userId && obj.volunteerId.userId.isActive === false) {
                obj.volunteerId = null;
            }
            return obj;
        });

        res.json(sanitizedHistory);
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

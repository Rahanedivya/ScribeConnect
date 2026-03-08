const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Student = require('./models/Student');

async function fixStudentProfile() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the user
        const user = await User.findOne({ email: 'test@scribeai.com' });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log('User found:', user.email);

        // Check if student profile already exists
        let student = await Student.findOne({ userId: user._id });

        if (student) {
            console.log('Student profile already exists');
            process.exit(0);
        }

        // Create student profile with all required fields
        student = await Student.create({
            userId: user._id,
            fullName: 'Test Student',
            phone: '1234567890',
            dateOfBirth: new Date('2000-01-01'),
            university: 'Test University',
            course: 'Computer Science',
            disabilityType: 'Visual Impairment',
            certificateNumber: 'CERT123',
            specificNeeds: 'Need help with reading exam questions',
            currentYear: '3rd Year',
            examFrequency: 'Monthly',
            preferredSubjects: ['Mathematics', 'Physics'],
            academicNotes: 'Excellent student',
            preferredLanguage: 'English',
            notificationMethod: 'Email',
            preferredTime: 'Morning'
        });

        console.log('Student profile created successfully!');
        console.log('Student ID:', student._id);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixStudentProfile();

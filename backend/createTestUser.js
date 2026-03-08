const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Student = require('./models/Student');

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if user exists
        let user = await User.findOne({ email: 'test@scribeai.com' });

        if (user) {
            console.log('User already exists');
            process.exit(0);
        }

        // Create user
        user = await User.create({
            email: 'test@scribeai.com',
            password: 'Test123!',
            role: 'student'
        });
        console.log('User created:', user.email);

        // Create student profile
        const student = await Student.create({
            userId: user._id,
            fullName: 'Test Student',
            phone: '1234567890',
            dateOfBirth: new Date('2000-01-01'),
            university: 'Test University',
            course: 'Computer Science',
            currentYear: '3rd Year',
            examFrequency: 'Monthly',
            preferredSubjects: ['Mathematics'],
            disabilityType: 'Visual Impairment',
            certificateNumber: 'CERT123',
            specificNeeds: 'Need help with reading exam questions',
            preferredLanguage: 'English',
            notificationMethod: 'Email',
            preferredTime: 'Morning'
        });
        console.log('Student profile created');

        console.log('\nTest user created successfully!');
        console.log('Email: test@scribeai.com');
        console.log('Password: Test123!');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestUser();

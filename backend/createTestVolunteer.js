const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Volunteer = require('./models/Volunteer');

async function createTestVolunteer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if user exists
        let user = await User.findOne({ email: 'volunteer@test.com' });

        if (user) {
            console.log('User already exists');

            // Check if volunteer profile exists
            const volunteer = await Volunteer.findOne({ userId: user._id });
            if (volunteer) {
                console.log('Volunteer profile already exists');
                process.exit(0);
            }
        } else {
            // Create user
            user = await User.create({
                email: 'volunteer@test.com',
                password: 'Test123!',
                role: 'volunteer'
            });
            console.log('User created:', user.email);
        }

        // Create volunteer profile with all required fields
        const volunteer = await Volunteer.create({
            userId: user._id,
            fullName: 'Test Volunteer',
            phone: '9876543210',
            dateOfBirth: new Date('1995-05-15'),
            city: 'Mumbai',
            state: 'Maharashtra',
            remoteAvailable: true,
            volunteerType: 'free',
            hourlyRate: 0,
            subjects: ['Mathematics', 'Physics', 'Chemistry'],
            languages: ['English', 'Hindi', 'Marathi'],
            availability: {
                monday: { morning: true, afternoon: false, evening: false },
                tuesday: { morning: true, afternoon: true, evening: false },
                wednesday: { morning: false, afternoon: true, evening: false },
                thursday: { morning: true, afternoon: false, evening: true },
                friday: { morning: true, afternoon: true, evening: false },
                saturday: { morning: false, afternoon: false, evening: false },
                sunday: { morning: false, afternoon: false, evening: false }
            }
        });

        console.log('Volunteer profile created successfully!');
        console.log('Volunteer ID:', volunteer._id);
        console.log('\nTest volunteer created successfully!');
        console.log('Email: volunteer@test.com');
        console.log('Password: Test123!');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestVolunteer();

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Volunteer = require('./models/Volunteer');

async function setupLastMinuteVolunteer() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find the volunteer with email 'jogesh_joy@example.com' or 'jogesh.joy@example.com'
        let user = await User.findOne({ 
            email: { $regex: 'jogesh', $options: 'i' } 
        });

        if (!user) {
            console.log('❌ Volunteer user not found. Searching for any volunteer...');
            user = await User.findOne({ role: 'volunteer' });
            if (!user) {
                console.log('❌ No volunteers found in database');
                process.exit(1);
            }
        }

        console.log(`✅ Found user: ${user.email}`);

        // Get volunteer profile
        let volunteer = await Volunteer.findOne({ userId: user._id });

        if (!volunteer) {
            console.log('❌ Volunteer profile not found, creating one...');
            volunteer = await Volunteer.create({
                userId: user._id,
                fullName: 'Test Volunteer',
                phone: '9876543210',
                dateOfBirth: new Date('1995-05-15'),
                city: 'Pune',  // Match student's city
                state: 'Maharashtra',
                remoteAvailable: true,
                volunteerType: 'free',
                hourlyRate: 0,
                subjects: ['Mathematics', 'Physics', 'Chemistry', 'English'],
                languages: ['English', 'Hindi', 'Marathi'],
                lastMinuteAvailable: true,
                isVerified: true
            });
            console.log('✅ Created volunteer profile');
        } else {
            console.log(`✅ Found volunteer profile: ${volunteer.fullName}`);
            console.log(`   Current city: ${volunteer.city}`);
            console.log(`   Last Minute Available: ${volunteer.lastMinuteAvailable}`);
            console.log(`   Verified: ${volunteer.isVerified}`);

            // Update volunteer to enable last minute support
            volunteer.lastMinuteAvailable = true;
            volunteer.isVerified = true;
            volunteer.city = 'Pune';  // Ensure correct city (case-insensitive)
            
            await volunteer.save();
            console.log('✅ Updated volunteer profile');
        }

        console.log('\n📋 Volunteer Details:');
        console.log(`   Name: ${volunteer.fullName}`);
        console.log(`   City: ${volunteer.city}`);
        console.log(`   Last Minute Available: ${volunteer.lastMinuteAvailable}`);
        console.log(`   Verified: ${volunteer.isVerified}`);
        
        // Check for students in the same city
        const Student = require('./models/Student');
        const studentsInCity = await Student.find({ city: { $regex: volunteer.city, $options: 'i' } }).populate('userId', 'email');
        console.log(`\n📋 Students in ${volunteer.city}:`);
        if (studentsInCity.length === 0) {
            console.log('   No students found in this city');
        } else {
            studentsInCity.forEach(student => {
                console.log(`   - ${student.fullName || 'NO NAME'} (${student.userId?.email})`);
            });
        }

        await mongoose.connection.close();
        console.log('\n✅ Setup complete');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setupLastMinuteVolunteer();

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');

async function fixMissingStudents() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all student users
        const users = await User.find({ role: 'student' });
        console.log(`\n📋 Found ${users.length} student users`);

        let fixed = 0;
        let skipped = 0;

        for (const user of users) {
            // Check if student record exists
            const existingStudent = await Student.findOne({ userId: user._id });

            if (!existingStudent) {
                console.log(`\n⚠️  Creating student record for: ${user.email}`);

                // Create a basic student record with placeholder values
                await Student.create({
                    userId: user._id,
                    fullName: 'Please Update Your Name',
                    phone: '0000000000',
                    dateOfBirth: new Date('2000-01-01'),
                    university: 'Please Update',
                    course: 'Please Update',
                    disabilityType: 'Visual Impairment',
                    specificNeeds: 'Please update your specific needs',
                    currentYear: 'Please Update',
                    examFrequency: 'Weekly',
                    preferredLanguage: 'English',
                    notificationMethod: 'Email',
                    preferredTime: 'Flexible'
                });

                console.log(`   ✅ Created student record for ${user.email}`);
                fixed++;
            } else {
                skipped++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Created: ${fixed} student records`);
        console.log(`   ⏭️  Skipped: ${skipped} (already exist)`);

        await mongoose.connection.close();
        console.log('\n✅ Fix complete');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixMissingStudents();

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');

async function checkDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all users
        const users = await User.find({}).select('email role');
        console.log('\n📋 All Users:');
        users.forEach(user => {
            console.log(`  - ${user.email} (${user.role}) - ID: ${user._id}`);
        });

        // Get all students
        const students = await Student.find({}).populate('userId', 'email');
        console.log('\n📋 All Students:');
        students.forEach(student => {
            console.log(`  - ${student.fullName || 'NO NAME'} - User: ${student.userId?.email || 'NO USER'} - UserID: ${student.userId?._id}`);
            console.log(`    Phone: ${student.phone || 'N/A'}, University: ${student.university || 'N/A'}`);
        });

        // Check for users without student records
        console.log('\n⚠️  Users without Student records:');
        for (const user of users) {
            if (user.role === 'student') {
                const student = await Student.findOne({ userId: user._id });
                if (!student) {
                    console.log(`  - ${user.email} (ID: ${user._id})`);
                }
            }
        }

        await mongoose.connection.close();
        console.log('\n✅ Database check complete');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkDatabase();

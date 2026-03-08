const mongoose = require('mongoose');
const { detectAndHandleNoShows, markRequestAsNoShow } = require('./noShowDetector');
const { handleVolunteerNoShow } = require('./punishmentSystem');

async function testPunishmentSystem() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/scribeconnect', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Testing punishment system...');

        // Test 1: Run no-show detection
        console.log('\n1. Running no-show detection...');
        const detectionResult = await detectAndHandleNoShows();
        console.log('Detection result:', detectionResult);

        // Test 2: Get a volunteer ID for testing (you would replace this with an actual volunteer ID)
        const Volunteer = require('../models/Volunteer');
        const volunteers = await Volunteer.find().limit(1);
        if (volunteers.length > 0) {
            const volunteerId = volunteers[0]._id;

            console.log('\n2. Testing manual no-show handling for volunteer:', volunteerId);

            // Test manual punishment (commented out to avoid actual punishment during testing)
            // const punishmentResult = await handleVolunteerNoShow(volunteerId);
            // console.log('Punishment result:', punishmentResult);
        }

        console.log('\n3. Test completed successfully!');
        console.log('Note: Actual punishment testing is commented out to avoid affecting real data.');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.connection.close();
    }
}

// Run test if this file is executed directly
if (require.main === module) {
    testPunishmentSystem();
}

module.exports = { testPunishmentSystem };
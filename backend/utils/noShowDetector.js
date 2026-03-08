const Request = require('../models/Request');
const { handleVolunteerNoShow } = require('./punishmentSystem');

/**
 * Detects and handles volunteer no-shows
 * This should be run periodically (e.g., daily) to check for missed sessions
 * @returns {Object} - Summary of processed no-shows
 */
const detectAndHandleNoShows = async () => {
    try {
        const now = new Date();

        // Find requests that should have been completed but are still in progress or accepted
        // and the exam date/time has passed
        const potentialNoShows = await Request.find({
            status: { $in: ['accepted', 'in-progress'] },
            volunteerId: { $ne: null },
            examDate: { $lte: now }
        }).populate('volunteerId');

        let processedCount = 0;
        let errors = [];

        for (const request of potentialNoShows) {
            try {
                // Check if exam time has passed (simplified check - you might want more sophisticated time parsing)
                const examDateTime = new Date(request.examDate);
                // Assuming examTime is in format like "10:00 AM"
                const timeMatch = request.examTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (timeMatch) {
                    let hours = parseInt(timeMatch[1]);
                    const minutes = parseInt(timeMatch[2]);
                    const ampm = timeMatch[3].toUpperCase();

                    if (ampm === 'PM' && hours !== 12) hours += 12;
                    if (ampm === 'AM' && hours === 12) hours = 0;

                    examDateTime.setHours(hours, minutes, 0, 0);
                }

                // Add some buffer time (e.g., 2 hours after exam end)
                const bufferTime = new Date(examDateTime);
                bufferTime.setHours(bufferTime.getHours() + 2);

                if (now > bufferTime) {
                    // Mark as no-show and apply punishment
                    request.status = 'volunteer_no_show';
                    await request.save();

                    if (request.volunteerId) {
                        await handleVolunteerNoShow(request.volunteerId._id);
                    }

                    processedCount++;
                }

            } catch (error) {
                errors.push({
                    requestId: request._id,
                    error: error.message
                });
            }
        }

        return {
            success: true,
            processedCount,
            errors,
            totalChecked: potentialNoShows.length
        };

    } catch (error) {
        console.error('Error detecting no-shows:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Manually mark a request as volunteer no-show (for admin use)
 * @param {string} requestId - The request ID
 * @returns {Object} - Result of the operation
 */
const markRequestAsNoShow = async (requestId) => {
    try {
        const request = await Request.findById(requestId).populate('volunteerId');

        if (!request) {
            return { success: false, error: 'Request not found' };
        }

        if (!request.volunteerId) {
            return { success: false, error: 'Request has no assigned volunteer' };
        }

        if (request.status === 'completed' || request.status === 'volunteer_no_show') {
            return { success: false, error: 'Request is already completed or marked as no-show' };
        }

        // Mark as no-show and apply punishment
        request.status = 'volunteer_no_show';
        await request.save();

        const punishmentResult = await handleVolunteerNoShow(request.volunteerId._id);

        return {
            success: true,
            requestId,
            volunteerId: request.volunteerId._id,
            punishment: punishmentResult
        };

    } catch (error) {
        console.error('Error marking request as no-show:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    detectAndHandleNoShows,
    markRequestAsNoShow
};
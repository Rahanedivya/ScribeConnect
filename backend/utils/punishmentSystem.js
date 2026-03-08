const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Handles punishment for volunteer no-shows based on tiered system
 * @param {string} volunteerId - The volunteer's ID
 * @returns {Object} - Punishment result details
 */
const handleVolunteerNoShow = async (volunteerId) => {
    try {
        const volunteer = await Volunteer.findById(volunteerId).populate('userId');
        if (!volunteer) {
            throw new Error('Volunteer not found');
        }

        // Increment no-show count
        volunteer.noShowCount += 1;
        volunteer.lastNoShowDate = new Date();

        let punishment = {
            tier: volunteer.noShowCount,
            actions: [],
            suspensionDays: 0,
            ratingPenalty: 0,
            permanentBan: false
        };

        // Determine punishment based on tier
        switch (volunteer.noShowCount) {
            case 1: // First offense
                punishment.suspensionDays = 7;
                punishment.ratingPenalty = 0.5;
                punishment.actions.push('7-day suspension', '0.5 rating penalty', 'warning notification');
                break;

            case 2: // Second offense
                punishment.suspensionDays = 30;
                punishment.ratingPenalty = 1.0;
                punishment.actions.push('30-day suspension', '1.0 rating penalty', 'admin review required');
                break;

            case 3: // Third offense
            default: // Any subsequent offenses
                punishment.permanentBan = true;
                punishment.actions.push('permanent ban', 'account deactivation');
                break;
        }

        // Apply rating penalty
        if (punishment.ratingPenalty > 0 && volunteer.rating > 0) {
            volunteer.rating = Math.max(0, volunteer.rating - punishment.ratingPenalty);
        }

        // Apply suspension or ban
        if (punishment.permanentBan) {
            // Permanent ban
            volunteer.userId.isActive = false;
            await volunteer.userId.save();
        } else if (punishment.suspensionDays > 0) {
            // Temporary suspension
            const suspensionEndDate = new Date();
            suspensionEndDate.setDate(suspensionEndDate.getDate() + punishment.suspensionDays);
            volunteer.suspensionEndDate = suspensionEndDate;
            volunteer.userId.isActive = false;
            await volunteer.userId.save();
        }

        await volunteer.save();

        // Create notification
        await createNoShowNotification(volunteer, punishment);

        return {
            success: true,
            volunteerId: volunteer._id,
            noShowCount: volunteer.noShowCount,
            punishment,
            suspensionEndDate: volunteer.suspensionEndDate
        };

    } catch (error) {
        console.error('Error handling volunteer no-show:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Creates a notification for the volunteer about their no-show punishment
 * @param {Object} volunteer - The volunteer document
 * @param {Object} punishment - The punishment details
 */
const createNoShowNotification = async (volunteer, punishment) => {
    try {
        let message = `You have been penalized for not attending a scheduled session. `;

        if (punishment.permanentBan) {
            message += `This is your ${punishment.tier}${getOrdinalSuffix(punishment.tier)} no-show offense. Your account has been permanently banned.`;
        } else {
            message += `This is your ${punishment.tier}${getOrdinalSuffix(punishment.tier)} no-show offense. `;
            message += `Actions taken: ${punishment.actions.join(', ')}. `;

            if (punishment.suspensionDays > 0) {
                message += `Your account will be suspended until ${volunteer.suspensionEndDate.toDateString()}.`;
            }
        }

        await Notification.create({
            userId: volunteer.userId._id,
            type: 'warning',
            title: 'No-Show Penalty Applied',
            message: message,
            isRead: false
        });

    } catch (error) {
        console.error('Error creating no-show notification:', error);
    }
};

/**
 * Checks if a volunteer's suspension has ended and reactivates their account
 * @param {string} volunteerId - The volunteer's ID
 * @returns {boolean} - Whether the account was reactivated
 */
const checkAndReactivateVolunteer = async (volunteerId) => {
    try {
        const volunteer = await Volunteer.findById(volunteerId).populate('userId');
        if (!volunteer || !volunteer.suspensionEndDate) {
            return false;
        }

        const now = new Date();
        if (now >= volunteer.suspensionEndDate && !volunteer.userId.isActive) {
            volunteer.userId.isActive = true;
            volunteer.suspensionEndDate = null;
            await volunteer.userId.save();
            await volunteer.save();

            // Create reactivation notification
            await Notification.create({
                userId: volunteer.userId._id,
                type: 'info',
                title: 'Account Reactivated',
                message: 'Your account suspension has ended. You may now accept new requests.',
                isRead: false
            });

            return true;
        }

        return false;

    } catch (error) {
        console.error('Error checking volunteer reactivation:', error);
        return false;
    }
};

/**
 * Helper function to get ordinal suffix
 * @param {number} num - The number
 * @returns {string} - The ordinal suffix
 */
const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
};

module.exports = {
    handleVolunteerNoShow,
    checkAndReactivateVolunteer
};
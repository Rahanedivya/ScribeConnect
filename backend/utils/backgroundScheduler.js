/**
 * Background Scheduler for ScribeConnect
 * Handles automatic reactivation of deactivated accounts and tracking of ignored requests
 */

const cron = require('node-cron');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const Request = require('../models/Request');

class BackgroundScheduler {
    /**
     * Initialize and start all scheduled tasks
     */
    static init() {
        // Run every hour to check for ignored requests and expired requests
        cron.schedule('0 * * * *', async () => {
            console.log('[Scheduler] Running hourly maintenance tasks...');
            try {
                await this.markIgnoredRequests();
                await this.markExpiredRequests();
                console.log('[Scheduler] Maintenance tasks completed successfully');
            } catch (error) {
                console.error('[Scheduler] Error in maintenance tasks:', error);
            }
        });

        console.log('[Scheduler] Background tasks initialized');
    }

    /**
     * Mark requests with past exam dates as expired
     */
    static async markExpiredRequests() {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        try {
            const expiredRequests = await Request.updateMany(
                {
                    status: { $in: ['pending', 'accepted'] },
                    examDate: { $lt: startOfToday }
                },
                {
                    $set: { status: 'expired' }
                }
            );

            if (expiredRequests.modifiedCount > 0) {
                console.log(`[Scheduler] Marked ${expiredRequests.modifiedCount} requests as expired`);
            }
        } catch (error) {
            console.error('[Scheduler] Error marking expired requests:', error);
        }
    }
}

module.exports = BackgroundScheduler;
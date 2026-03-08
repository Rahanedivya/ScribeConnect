/**
 * AI-Powered Volunteer Matching Engine
 * Uses intelligent scoring algorithm to match students with volunteers
 * Based on: Subject expertise, availability, ratings, workload, location, and specialization
 */

const Volunteer = require('../models/Volunteer');
const Request = require('../models/Request');
const Student = require('../models/Student');

class AIMatchingEngine {
    /**
     * Get AI-ranked volunteers for a student request
     * @param {Object} requestData - Request details (subject, examDate, examTime, city, disabilityType)
     * @param {String} studentCity - Student's city
     * @param {String} studentDisability - Student's disability type
     * @returns {Promise<Array>} Ranked list of volunteers with scores
     */
    static async getSmartMatches(requestData, studentCity, studentDisability) {
        try {
            const { subject, examDate, examTime, duration } = requestData;

            // Get all available volunteers
            let candidateVolunteers = await Volunteer.find({
                lastMinuteAvailable: true,
                isVerified: true
            }).lean();

            if (candidateVolunteers.length === 0) {
                console.log('[AI] No verified volunteers available for matching');
                return [];
            }

            // Score each volunteer
            const scoredVolunteers = await Promise.all(
                candidateVolunteers.map(vol =>
                    this.scoreVolunteer(vol, requestData, studentCity, studentDisability)
                )
            );

            // Sort by score (highest first) and filter out zero scores
            const rankedVolunteers = scoredVolunteers
                .filter(v => v.totalScore > 0)
                .sort((a, b) => b.totalScore - a.totalScore);

            console.log(`[AI] Ranked ${rankedVolunteers.length} volunteers for subject: ${subject}, time: ${examTime}`);

            return rankedVolunteers;
        } catch (error) {
            console.error('Error in AI matching:', error);
            return [];
        }
    }

    /**
     * Calculate comprehensive score for a volunteer
     * Score breakdown: 0-100 scale
     * - Subject expertise: 0-30 points
     * - Availability match: 0-20 points
     * - Rating/Performance: 0-25 points
     * - Workload balance: 0-15 points
     * - Location preference: 0-10 points
     */
    static async scoreVolunteer(volunteer, requestData, studentCity, studentDisability) {
        const { subject, examDate, examTime, duration } = requestData;

        let totalScore = 0;
        const scoreBreakdown = {};

        // 1. SUBJECT EXPERTISE MATCH (30 points max)
        const subjectScore = this.calculateSubjectScore(volunteer.subjects, subject);
        scoreBreakdown.subjectExpertise = subjectScore;
        totalScore += subjectScore;

        // 2. AVAILABILITY MATCH (20 points max)
        const availabilityScore = this.calculateAvailabilityScore(volunteer.availability, examDate, examTime);
        scoreBreakdown.availability = availabilityScore;
        totalScore += availabilityScore;

        // 3. RATING & PERFORMANCE (25 points max)
        const performanceScore = this.calculatePerformanceScore(volunteer.rating, volunteer.totalAssignments, volunteer.totalRatings);
        scoreBreakdown.performance = performanceScore;
        totalScore += performanceScore;

        // 4. WORKLOAD BALANCE (15 points max)
        const workloadScore = await this.calculateWorkloadScore(volunteer._id);
        scoreBreakdown.workload = workloadScore;
        totalScore += workloadScore;

        // 5. LOCATION & DELIVERY PREFERENCE (10 points max)
        const locationScore = this.calculateLocationScore(volunteer, studentCity);
        scoreBreakdown.location = locationScore;
        totalScore += locationScore;

        return {
            _id: volunteer._id,
            fullName: volunteer.fullName,
            city: volunteer.city,
            rating: volunteer.rating,
            profilePicture: volunteer.profilePicture,
            subjects: volunteer.subjects,
            languages: volunteer.languages,
            totalAssignments: volunteer.totalAssignments,
            lastMinuteCount: volunteer.lastMinuteCount,
            lastMinuteHero: volunteer.lastMinuteHero,
            remoteAvailable: volunteer.remoteAvailable,
            hourlyRate: volunteer.hourlyRate,
            volunteerType: volunteer.volunteerType,
            totalScore: Math.round(totalScore * 10) / 10, // Round to 1 decimal place
            scoreBreakdown: scoreBreakdown,
            matchPercentage: Math.round((totalScore / 100) * 100) // Convert to percentage
        };
    }

    /**
     * Subject Expertise Scoring (0-30 points)
     * Awards points based on exact and partial matches
     */
    static calculateSubjectScore(volunteerSubjects, requestedSubject) {
        if (!volunteerSubjects || volunteerSubjects.length === 0) {
            return 0; // No subjects listed = no expertise match
        }

        const normalizedVolunteerSubjects = volunteerSubjects.map(s => s.toLowerCase().trim());
        const normalizedRequestedSubject = requestedSubject.toLowerCase().trim();

        // Exact match: 30 points
        if (normalizedVolunteerSubjects.includes(normalizedRequestedSubject)) {
            return 30;
        }

        // Partial match (subject contains part of requested subject): 20 points
        const partialMatch = normalizedVolunteerSubjects.some(s => 
            normalizedRequestedSubject.includes(s) || s.includes(normalizedRequestedSubject)
        );
        if (partialMatch) {
            return 20;
        }

        // Related subject categories: 10 points
        const subjectCategories = {
            'Mathematics': ['math', 'calculus', 'algebra', 'geometry', 'statistics'],
            'Science': ['physics', 'chemistry', 'biology', 'science'],
            'Language': ['english', 'hindi', 'spanish', 'french', 'language'],
            'Social Studies': ['history', 'geography', 'political', 'economics']
        };

        for (const [category, subjects] of Object.entries(subjectCategories)) {
            const volunteersInCategory = normalizedVolunteerSubjects.some(s =>
                subjects.some(cat => s.includes(cat))
            );
            const requestInCategory = subjects.some(cat => normalizedRequestedSubject.includes(cat));

            if (volunteersInCategory && requestInCategory) {
                return 10;
            }
        }

        return 0; // No subject match
    }

    /**
     * Availability Scoring (0-20 points)
     * Awards points based on exact time slot availability
     */
    static calculateAvailabilityScore(volunteerAvailability, examDate, examTime) {
        if (!volunteerAvailability || !examDate || !examTime) {
            return 0;
        }

        try {
            const dateObj = new Date(examDate);
            const dayOfWeek = this.getDayOfWeek(dateObj);

            // Extract time of day from examTime (e.g., "09:00" -> morning/afternoon/evening)
            const hour = parseInt(examTime.split(':')[0]);
            let timeSlot = this.getTimeSlot(hour);

            // Check if volunteer is available at that time
            if (volunteerAvailability[dayOfWeek] && volunteerAvailability[dayOfWeek][timeSlot]) {
                return 20; // Maximum availability match
            }

            // Partial match: volunteer available but different time slot (10 points)
            const otherSlots = ['morning', 'afternoon', 'evening'].filter(slot => slot !== timeSlot);
            const hasOtherAvailability = otherSlots.some(slot =>
                volunteerAvailability[dayOfWeek] && volunteerAvailability[dayOfWeek][slot]
            );

            if (hasOtherAvailability) {
                return 10;
            }

            // Available on different day (5 points)
            const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const hasAnyAvailability = daysOfWeek.some(day =>
                volunteerAvailability[day] && Object.values(volunteerAvailability[day]).some(slot => slot)
            );

            return hasAnyAvailability ? 5 : 0;
        } catch (error) {
            console.error('Error calculating availability score:', error);
            return 0;
        }
    }

    /**
     * Performance Score (0-25 points)
     * Based on rating, completion rate, and rating count
     */
    static calculatePerformanceScore(rating, totalAssignments, totalRatings) {
        if (!rating || totalAssignments === 0) {
            return 0; // No experience = no score
        }

        // Base score on rating (0-20 points)
        const ratingScore = (rating / 5) * 20;

        // Bonus points for high completion/rating count (0-5 points)
        let completionBonus = 0;
        if (totalAssignments >= 50) completionBonus = 5; // 50+ assignments
        else if (totalAssignments >= 20) completionBonus = 3;
        else if (totalAssignments >= 10) completionBonus = 1;

        return Math.round(ratingScore + completionBonus);
    }

    /**
     * Workload Score (0-15 points)
     * Volunteers with lower current workload get higher scores
     */
    static async calculateWorkloadScore(volunteerId) {
        try {
            // Count active requests (pending, accepted, in-progress)
            const activeRequests = await Request.countDocuments({
                volunteerId: volunteerId,
                status: { $in: ['pending', 'accepted', 'in-progress'] }
            });

            // Scale: 0 active = 15 points, 5+ active = 0 points
            const maxActiveRequests = 5;
            const workloadScore = Math.max(0, 15 - (activeRequests / maxActiveRequests * 15));

            return Math.round(workloadScore);
        } catch (error) {
            console.error('Error calculating workload score:', error);
            return 15; // Default to high availability if error
        }
    }

    /**
     * Location Score (0-10 points)
     * Volunteers in same city or with remote availability get higher scores
     */
    static calculateLocationScore(volunteer, studentCity) {
        // Same city: 10 points
        if (volunteer.city && volunteer.city.toLowerCase() === studentCity.toLowerCase()) {
            return 10;
        }

        // Remote available: 7 points
        if (volunteer.remoteAvailable) {
            return 7;
        }

        // Different city but in same state might be worth some points (optional)
        // For now, no points for different city + no remote

        return 0;
    }

    /**
     * Get day of week name from date
     */
    static getDayOfWeek(date) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    }

    /**
     * Get time slot based on hour
     */
    static getTimeSlot(hour) {
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        return 'evening';
    }

    /**
     * Get recommended volunteer from top matches
     * Can be used for automatic allocation
     */
    static async getRecommendedVolunteer(requestData, studentCity, studentDisability) {
        const matches = await this.getSmartMatches(requestData, studentCity, studentDisability);

        if (matches.length === 0) {
            return null;
        }

        // Return top match
        return matches[0];
    }

    /**
     * Get multiple recommendations (top 5)
     * Useful for presenting options to student
     */
    static async getTopRecommendations(requestData, studentCity, studentDisability, limit = 5) {
        const matches = await this.getSmartMatches(requestData, studentCity, studentDisability);
        return matches.slice(0, limit);
    }

    /**
     * Calculate overall compatibility between student and volunteer
     * Returns percentage match score
     */
    static async getCompatibilityScore(volunteerId, requestData, studentCity) {
        try {
            const volunteer = await Volunteer.findById(volunteerId).lean();
            if (!volunteer) return 0;

            const scored = await this.scoreVolunteer(volunteer, requestData, studentCity, null);
            return scored.matchPercentage;
        } catch (error) {
            console.error('Error calculating compatibility:', error);
            return 0;
        }
    }
}

module.exports = AIMatchingEngine;

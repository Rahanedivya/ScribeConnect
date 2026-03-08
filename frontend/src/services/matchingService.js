import API_BASE_URL from '../config/api';

/**
 * Matching Service
 * Handles all AI-powered volunteer matching API calls
 */

class MatchingService {
    /**
     * Get AI-ranked volunteers for a request
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} Ranked list of volunteers with scores
     */
    async getSmartVolunteerMatches(params) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(
            `${API_BASE_URL}/matching/smart-volunteers?${queryString}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch smart volunteer matches');
        }

        return data;
    }

    /**
     * Get top 5 volunteer recommendations
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} Top ranked volunteers
     */
    async getTopRecommendations(params) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(
            `${API_BASE_URL}/matching/top-recommendations?${queryString}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch recommendations');
        }

        return data;
    }

    /**
     * Auto-allocate best-matched volunteer
     * @param {String} requestId - Request ID
     * @returns {Promise<Object>} Allocation result
     */
    async autoAllocateVolunteer(requestId) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(
            `${API_BASE_URL}/matching/auto-allocate`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ requestId })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to auto-allocate volunteer');
        }

        return data;
    }

    /**
     * Get compatibility score
     * @param {Object} params - Volunteer ID and request details
     * @returns {Promise<Object>} Compatibility score and details
     */
    async getVolunteerCompatibility(params) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(
            `${API_BASE_URL}/matching/volunteer-compatibility?${queryString}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to calculate compatibility');
        }

        return data;
    }

    /**
     * Get matching analytics
     * @returns {Promise<Object>} Analytics data
     */
    async getMatchingAnalytics() {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(
            `${API_BASE_URL}/matching/analytics`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch analytics');
        }

        return data;
    }
}

export default new MatchingService();

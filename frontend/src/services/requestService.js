import API_BASE_URL from '../config/api';

/**
 * Request Service
 * Handles all scribe request-related API calls
 */

class RequestService {
    /**
     * Create a new scribe request
     * @param {Object} requestData - Request details
     * @returns {Promise<Object>} Created request
     */
    async createRequest(requestData) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/students/requests`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create request');
        }

        return data;
    }

    /**
     * Get all student requests
     * @returns {Promise<Array>} List of all requests
     */
    async getRequests() {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/students/requests`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch requests');
        }

        return data;
    }

    /**
     * Get request history (completed/cancelled)
     * @returns {Promise<Array>} List of historical requests
     */
    async getHistory() {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/students/history`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch history');
        }

        return data;
    }

    /**
     * Get a specific request by ID
     * @param {string} requestId - Request ID
     * @returns {Promise<Object>} Request details
     */
    async getRequestById(requestId) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch request');
        }

        return data;
    }

    /**
     * Update a request
     * @param {string} requestId - Request ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated request
     */
    async updateRequest(requestId, updates) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update request');
        }

        return data;
    }

    /**
     * Cancel a request
     * @param {string} requestId - Request ID
     * @returns {Promise<Object>} Cancellation confirmation
     */
    async cancelRequest(requestId) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to cancel request');
        }

        return data;
    }

    /**
     * Complete a request with rating and feedback
     * @param {string} requestId - Request ID
     * @param {number} rating - Rating (1-5)
     * @param {string} feedback - Feedback text
     * @returns {Promise<Object>} Completed request
     */
    async completeRequest(requestId, rating, feedback = '') {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/requests/${requestId}/complete`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rating, feedback })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to complete request');
        }

        return data;
    }

    /**
     * Rate a volunteer after request completion
     * @param {string} requestId - Request ID
     * @param {number} rating - Rating (1-5)
     * @param {string} feedback - Optional feedback text
     * @returns {Promise<Object>} Updated request with rating
     */
    async rateVolunteer(requestId, rating, feedback = '') {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/requests/${requestId}/rate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rating, feedback })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to rate volunteer');
        }

        return data;
    }

    /**
     * Request urgent support for a cancelled/declined request
     * @param {string} requestId - Request ID
     * @returns {Promise<Object>} Updated request marked as urgent
     */
    async requestUrgentSupport(requestId) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/requests/${requestId}/request-urgent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to request urgent support');
        }

        return data;
    }
}

export default new RequestService();

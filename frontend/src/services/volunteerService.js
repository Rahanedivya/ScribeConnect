import API_BASE_URL from '../config/api';

/**
 * Volunteer Service
 * Handles all volunteer-related API calls
 */

class VolunteerService {
    /**
     * Get volunteer profile
     * @returns {Promise<Object>} Volunteer profile data
     */
    async getProfile() {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/volunteers/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch profile');
        }

        return data;
    }

    /**
     * Update volunteer profile
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated volunteer profile
     */
    async updateProfile(updates) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/volunteers/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }

        return data;
    }

    /**
     * Get incoming requests (available for volunteers to accept)
     * @returns {Promise<Array>} List of pending requests
     */
    async getIncomingRequests() {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/volunteers/incoming`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch incoming requests');
        }

        return data;
    }

    /**
     * Accept a scribe request
     * @param {string} requestId - ID of the request to accept
     * @returns {Promise<Object>} Updated request
     */
    async acceptRequest(requestId) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/volunteers/accept/${requestId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to accept request');
        }

        return data;
    }

    /**
     * Decline/Cancel an accepted request
     * @param {string} requestId - ID of the request to decline
     * @param {string} reason - Reason for declining
     * @returns {Promise<Object>} Updated request
     */
    async declineRequest(requestId, reason) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/volunteers/decline/${requestId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to decline request');
        }

        return data;
    }

    /**
     * Get active assignments
     * @returns {Promise<Array>} List of accepted/in-progress assignments
     */
    async getActiveAssignments() {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/volunteers/active`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch active assignments');
        }

        return data;
    }

    /**
     * Get assignment history
     * @returns {Promise<Array>} List of completed assignments
     */
    async getHistory() {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/volunteers/history`, {
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
     * Get volunteer statistics (rating, reviews, completed assignments)
     * @returns {Promise<Object>} Volunteer stats
     */
    async getStats() {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/volunteers/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch stats');
        }

        return data;
    }

    /**
     * Upload profile photo
     * @param {File} file - Image file to upload
     * @returns {Promise<Object>} Updated profile with photo URL
     */
    async uploadProfilePhoto(file) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch(`${API_BASE_URL}/volunteers/profile/photo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload photo');
        }

        return data;
    }

    /**
     * Toggle last-minute availability status
     * @param {boolean} available - Whether volunteer is available for last-minute requests
     * @returns {Promise<Object>} Updated volunteer profile
     */
    async toggleLastMinuteAvailability(available) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/volunteers/toggle-last-minute`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ available })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to toggle last-minute availability');
        }

        return data;
    }

    /**
     * Get urgent requests waiting for volunteers
     * @returns {Promise<Array>} List of urgent requests
     */
    async getUrgentRequests() {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/volunteers/urgent-requests`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch urgent requests');
        }

        return data.requests || [];
    }

    /**
     * Delete/Remove a request from active assignments
     * @param {string} requestId - ID of the request to delete
     * @returns {Promise<Object>} Deletion response
     */
    async deleteRequest(requestId) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/volunteers/requests/${requestId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete request');
        }

        return data;
    }
}

export default new VolunteerService();

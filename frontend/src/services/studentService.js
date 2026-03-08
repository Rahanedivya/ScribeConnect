import API_BASE_URL from '../config/api';

/**
 * Student Service
 * Handles all student-related API calls
 */

class StudentService {
    /**
     * Get student profile
     * @returns {Promise<Object>} Student profile data
     */
    async getProfile() {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/students/profile`, {
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
     * Update student profile
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated student profile
     */
    async updateProfile(updates) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/students/profile`, {
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
     * Get student's requests
     * @returns {Promise<Array>} List of student's requests
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
     * Get student's request history
     * @returns {Promise<Array>} List of completed/cancelled requests
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
     * Get all available volunteers
     * @returns {Promise<Array>} List of available volunteers
     */
    async getAvailableVolunteers() {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/volunteers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch volunteers');
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

        const response = await fetch(`${API_BASE_URL}/students/profile/photo`, {
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
     * Upload request materials
     * @param {string} requestId - Request ID
     * @param {File} file - File to upload
     * @returns {Promise<Object>} Updated request
     */
    async uploadRequestMaterials(requestId, file) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const formData = new FormData();
        formData.append('materials', file);

        const response = await fetch(`${API_BASE_URL}/requests/${requestId}/materials`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload materials');
        }

        return data;
    }
    /**
     * Delete request material
     * @param {string} requestId - Request ID
     * @param {string} filename - Filename to delete
     * @returns {Promise<Object>} Updated request
     */
    async deleteRequestMaterial(requestId, filename) {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/requests/${requestId}/materials`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete material');
        }

        return data;
    }
}

export default new StudentService();

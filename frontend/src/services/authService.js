import API_BASE_URL from '../config/api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

class AuthService {
    /**
     * Register a new student
     * @param {Object} studentData - Student registration data
     * @returns {Promise<Object>} User data with token
     */
    async registerStudent(studentData) {
        const response = await fetch(`${API_BASE_URL}/auth/register/student`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Store token in localStorage
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                _id: data._id,
                email: data.email,
                role: data.role,
            }));
        }

        return data;
    }

    /**
     * Register a new volunteer
     * @param {Object} volunteerData - Volunteer registration data
     * @returns {Promise<Object>} User data with token
     */
    async registerVolunteer(volunteerData) {
        const response = await fetch(`${API_BASE_URL}/auth/register/volunteer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(volunteerData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Store token in localStorage
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                _id: data._id,
                email: data.email,
                role: data.role,
            }));
        }

        return data;
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data with token
     */
    async login(email, password) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token in localStorage
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                _id: data._id,
                email: data.email,
                role: data.role,
            }));
        }

        return data;
    }

    /**
     * Get current user profile
     * @returns {Promise<Object>} User profile data
     */
    async getCurrentUser() {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('No token found');
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            // If token is invalid, clear storage
            if (response.status === 401) {
                this.logout();
            }
            throw new Error(data.message || 'Failed to get user data');
        }

        return data;
    }

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    /**
     * Get stored token
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Get stored user data
     * @returns {Object|null}
     */
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}

export default new AuthService();

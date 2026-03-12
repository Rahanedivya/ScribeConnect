import API_BASE_URL from "../config/api";

const LAST_MINUTE_API = `${API_BASE_URL}/last-minute`;

const lastMinuteService = {
    // Student Side APIs
    
    // Get all volunteers available for last minute allocation
    getAvailableVolunteers: async (studentCity) => {
        try {
            const response = await fetch(`${LAST_MINUTE_API}/available-volunteers?city=${studentCity}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch available volunteers');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching available volunteers:', error);
            throw error;
        }
    },

    // Send last minute request to a volunteer
    sendLastMinuteRequest: async (volunteerId, requestData) => {
        try {
            const response = await fetch(`${LAST_MINUTE_API}/send-request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    volunteerId,
                    ...requestData
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to send last minute request');
            }
            return data;
        } catch (error) {
            console.error('Error sending last minute request:', error);
            throw error;
        }
    },

    // Get student's last minute requests
    getStudentLastMinuteRequests: async () => {
        try {
            const response = await fetch(`${LAST_MINUTE_API}/student/requests`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch student last minute requests');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching student last minute requests:', error);
            throw error;
        }
    },

    // Volunteer Side APIs

    // Get volunteer's last minute requests
    getVolunteerLastMinuteRequests: async () => {
        try {
            const response = await fetch(`${LAST_MINUTE_API}/volunteer/requests`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch volunteer last minute requests');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching volunteer last minute requests:', error);
            throw error;
        }
    },

    // Accept last minute request
    acceptLastMinuteRequest: async (requestId) => {
        try {
            const response = await fetch(`${LAST_MINUTE_API}/volunteer/accept/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to accept last minute request');
            }
            return await response.json();
        } catch (error) {
            console.error('Error accepting last minute request:', error);
            throw error;
        }
    },

    // Reject/Decline last minute request
    rejectLastMinuteRequest: async (requestId, reason) => {
        try {
            const response = await fetch(`${LAST_MINUTE_API}/volunteer/reject/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            if (!response.ok) {
                throw new Error('Failed to reject last minute request');
            }
            return await response.json();
        } catch (error) {
            console.error('Error rejecting last minute request:', error);
            throw error;
        }
    },

    // Update volunteer's last minute availability
    updateLastMinuteAvailability: async (available) => {
        try {
            const response = await fetch(`${LAST_MINUTE_API}/volunteer/availability`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lastMinuteAvailable: available })
            });
            if (!response.ok) {
                throw new Error('Failed to update last minute availability');
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating last minute availability:', error);
            throw error;
        }
    },

    // Get volunteer last minute stats
    getVolunteerLastMinuteStats: async () => {
        try {
            const response = await fetch(`${LAST_MINUTE_API}/volunteer/stats`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch last minute stats');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching last minute stats:', error);
            throw error;
        }
    }
};

export default lastMinuteService;

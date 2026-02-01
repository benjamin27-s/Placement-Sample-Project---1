// API Configuration and Helper Functions

const API_BASE_URL = 'http://localhost:5000/api';

// Get stored token
const getToken = () => localStorage.getItem('token');

// Get stored user
const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Save auth data
const saveAuth = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

// Clear auth data
const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// API Request wrapper
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        // Handle unauthorized
        if (response.status === 401) {
            clearAuth();
            window.location.href = '/login.html';
            throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Auth API
const authAPI = {
    register: async (userData) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    login: async (credentials) => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    getMe: async () => {
        return apiRequest('/auth/me');
    }
};

// Reviews API
const reviewsAPI = {
    // Submit a new review (USER)
    submit: async (reviewData) => {
        return apiRequest('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    },

    // Get user's own reviews (USER)
    getMyReviews: async () => {
        return apiRequest('/reviews/my');
    },

    // Get all reviews (MODERATOR)
    getAllReviews: async (status = '') => {
        const query = status ? `?status=${status}` : '';
        return apiRequest(`/reviews${query}`);
    },

    // Approve a review (MODERATOR)
    approve: async (reviewId) => {
        return apiRequest(`/reviews/${reviewId}/approve`, {
            method: 'PUT'
        });
    },

    // Reject a review (MODERATOR)
    reject: async (reviewId) => {
        return apiRequest(`/reviews/${reviewId}/reject`, {
            method: 'PUT'
        });
    }
};

// Export for use in other scripts
window.API = {
    getToken,
    getUser,
    saveAuth,
    clearAuth,
    auth: authAPI,
    reviews: reviewsAPI
};

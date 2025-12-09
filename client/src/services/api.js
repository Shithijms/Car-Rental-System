import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Cars API
export const carsAPI = {
    getAll: (params = {}) => api.get('/cars', { params }),
    getById: (id) => api.get(`/cars/${id}`),
    create: (carData) => api.post('/cars', carData),
    update: (id, carData) => api.put(`/cars/${id}`, carData),
    delete: (id) => api.delete(`/cars/${id}`),
    updateAvailability: (id, status) => api.patch(`/cars/${id}/availability`, { status }),
    uploadImage: (id, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return api.post(`/cars/${id}/upload-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// Rentals API
export const rentalsAPI = {
    create: (rentalData) => api.post('/rentals', rentalData),
    getMyBookings: (params = {}) => api.get('/rentals/my-bookings', { params }),
    getById: (id) => api.get(`/rentals/${id}`),
    updateStatus: (id, status) => api.patch(`/rentals/${id}/status`, { status }),
    returnCar: (id, endMileage) => api.post(`/rentals/${id}/return`, { end_mileage: endMileage }),
    getOwnerBookings: (params = {}) => api.get('/rentals/owner/bookings', { params }),
};

// Payments API
export const paymentsAPI = {
    process: (paymentData) => api.post('/payments/process', paymentData),
    getHistory: (params = {}) => api.get('/payments/history', { params }),
    getDetails: (id) => api.get(`/payments/${id}`),
    getByRental: (rentalId) => api.get(`/payments/rental/${rentalId}`),
    updateStatus: (id, status) => api.put(`/payments/${id}/status`, { payment_status: status }),
    processRefund: (id, reason) => api.post(`/payments/${id}/refund`, { reason }),
};

// Categories API
export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    create: (categoryData) => api.post('/categories', categoryData),
    update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Discounts API
export const discountsAPI = {
    validate: (code, rentalDays = 1) => api.post('/discounts/validate', { code, rental_days: rentalDays }),
    getAll: (params = {}) => api.get('/discounts', { params }),
    create: (discountData) => api.post('/discounts', discountData),
    delete: (id) => api.delete(`/discounts/${id}`),
};

// Reviews API
export const reviewsAPI = {
    submit: (reviewData) => api.post('/reviews', reviewData),
    getByCar: (carId, params = {}) => api.get(`/reviews/car/${carId}`, { params }),
    getMyReviews: (params = {}) => api.get('/reviews/my-reviews', { params }),
};

// Dashboard API
export const dashboardAPI = {
    getOwnerStats: () => api.get('/dashboard/owner/stats'),
    getBranchStats: (branchId) => api.get(`/dashboard/branch/${branchId}/stats`),
};

// Branches API
export const branchesAPI = {
    getAll: () => api.get('/branches'),
    getById: (id) => api.get(`/branches/${id}`),
    getReport: (id) => api.get(`/branches/${id}/report`),
};

// Health check
export const healthAPI = {
    check: () => api.get('/health'),
};

export default api;
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sz_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sz_token');
      localStorage.removeItem('sz_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Property APIs
export const propertyAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  getMyProperties: () => api.get('/properties/my-properties'),
  delete: (id) => api.delete(`/properties/${id}`),
};

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getOwnerRequests: () => api.get('/bookings/owner-requests'),
  approve: (id) => api.put(`/bookings/${id}/approve`),
};

// Review APIs
export const reviewAPI = {
  create: (propertyId, data) => api.post(`/reviews/property/${propertyId}`, data),
  getByProperty: (propertyId) => api.get(`/reviews/property/${propertyId}`),
};

// Wishlist APIs
export const wishlistAPI = {
  getAll: () => api.get('/wishlist'),
  toggle: (propertyId) => api.post(`/wishlist/${propertyId}`),
};

// Admin APIs
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  verifyUser: (id) => api.put(`/admin/users/${id}/verify`),
  getPendingProperties: () => api.get('/admin/properties/pending'),
  approveProperty: (id) => api.put(`/admin/properties/${id}/approve`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

// Payment APIs
export const paymentAPI = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify', data),
};

// Upload APIs
export const uploadAPI = {
  uploadGovId: (data) => api.post('/upload/gov-id', data),
  getGovId: (userId) => api.get(`/upload/gov-id/${userId}`),
};

export default api;

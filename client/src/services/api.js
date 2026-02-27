import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: async (email, password) => {
    // Send explicit 'email' and 'password' to Django login endpoint.
    const resp = await api.post('/auth/login/', { email, password });
    // resp.data should contain 'access' token
    const token = resp.data.access || resp.data.token;
    if (token) {
      // store token temporarily and fetch user profile
      localStorage.setItem('token', token);
      try {
        const me = await api.get('/users/me/');
        return { data: { success: true, token, user: me.data } };
      } catch (err) {
        return { data: { success: true, token, user: null } };
      }
    }
    return resp;
  },
  getCurrentUser: () => api.get('/users/me/')
};

// Donor API calls
export const donorAPI = {
  getAllDonors: () => api.get('/donors'),
  getNearbyDonors: (bloodType, latitude, longitude, radius) =>
    api.get('/donors/nearby', { params: { bloodType, latitude, longitude, radius } }),
  getDonorById: (id) => api.get(`/donors/${id}`),
  registerAsDonor: (donorData) => api.post('/donors/register', donorData),
  updateDonorProfile: (id, donorData) => api.put(`/donors/${id}`, donorData),
  getDonationHistory: (donorId) => api.get(`/donors/${donorId}/donations`),
  acceptRequest: (requestId, donorId) => api.post(`/donors/accept-request`, { requestId, donorId })
};

// Blood Request API calls
export const requestAPI = {
  getAllRequests: () => api.get('/requests'),
  getPendingRequests: () => api.get('/requests/pending'),
  getRequestById: (id) => api.get(`/requests/${id}`),
  createRequest: (requestData) => api.post('/requests', requestData),
  updateRequest: (id, requestData) => api.put(`/requests/${id}`, requestData),
  deleteRequest: (id) => api.delete(`/requests/${id}`),
  getRequestsByUser: (userId) => api.get(`/requests/user/${userId}`)
};

// User Profile API calls
export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, profileData) => api.put(`/users/${userId}`, profileData),
  deleteAccount: (userId) => api.delete(`/users/${userId}`)
};

// Verification & admin actions
export const verificationAPI = {
  uploadDocument: (userId, formData) => api.post(`/users/${userId}/upload-docs`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  adminPendingVerifications: () => api.get('/admin/pending-verifications'),
  adminVerifyUser: (userId, verified) => api.put(`/users/${userId}/verify`, { verified })
};

export const pushAPI = {
  subscribe: (subscription) => api.post('/users/push/subscribe', { subscription })
};

export default api;

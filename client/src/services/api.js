import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

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
  getAllDonors: () => api.get('/users/?role=donor'),
  getNearbyDonors: async (bloodType, latitude, longitude, radius) => {
    try {
      const response = await api.get('/users/', { 
        params: { blood_type: bloodType } 
      });
      return { data: { success: true, data: response.data } };
    } catch (error) {
      return { data: { success: false, data: [] } };
    }
  },
  getDonorById: (id) => api.get(`/users/${id}/`),
  registerAsDonor: (donorData) => api.post('/users/', donorData),
  updateDonorProfile: (id, donorData) => api.put(`/users/${id}/`, donorData),
  getDonationHistory: async (donorId) => {
    try {
      const response = await api.get('/requests/', { 
        params: { requester: donorId } 
      });
      return { data: { success: true, data: response.data } };
    } catch (error) {
      return { data: { success: false, data: [] } };
    }
  },
  acceptRequest: async (requestId, donorId) => {
    try {
      const response = await api.put(`/requests/${requestId}/`, { 
        status: 'matched' 
      });
      return { data: { success: true, data: response.data } };
    } catch (error) {
      throw error;
    }
  }
};

// Blood Request API calls
export const requestAPI = {
  getAllRequests: () => api.get('/requests/'),
  getPendingRequests: () => api.get('/requests/?status=pending'),
  getRequestById: (id) => api.get(`/requests/${id}/`),
  createRequest: async (requestData) => {
    try {
      const response = await api.post('/requests/', requestData);
      return { data: { success: true, data: response.data } };
    } catch (error) {
      throw error;
    }
  },
  updateRequest: (id, requestData) => api.put(`/requests/${id}/`, requestData),
  deleteRequest: (id) => api.delete(`/requests/${id}/`),
  getRequestsByUser: (userId) => api.get(`/requests/?requester=${userId}`)
};

// User Profile API calls
export const userAPI = {
  getProfile: (userId) => api.get(`/users/me/`),
  updateProfile: (userId, profileData) => {
    // Check if profileData is FormData
    if (profileData instanceof FormData) {
      return api.patch(`/users/me/`, profileData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.put(`/users/me/`, profileData);
  },
  deleteAccount: (userId) => api.delete(`/users/${userId}/`)
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


// Matching API calls
export const matchAPI = {
  createMatch: (requestId) => api.post('/matches/', { request_id: requestId }),
  getMatches: () => api.get('/matches/'),
  getMatch: (id) => api.get(`/matches/${id}/`),
  completeMatch: (id) => api.post(`/matches/${id}/complete/`),
  cancelMatch: (id, reason) => api.post(`/matches/${id}/cancel/`, { reason }),
  rateMatch: (id, rating, feedback) => api.post(`/matches/${id}/rate/`, { rating, feedback })
};

// Messaging API calls
export const messageAPI = {
  getMessages: (matchId) => api.get(`/messages/?match_id=${matchId}`),
  sendMessage: (matchId, content) => api.post('/messages/', { match_id: matchId, content }),
  markAsRead: (messageId) => api.post(`/messages/${messageId}/mark_read/`),
  getUnreadCount: () => api.get('/messages/unread_count/')
};


// Certificate API calls
export const certificateAPI = {
  getMyCertificates: () => api.get('/certificates/my_certificates/'),
  getAllCertificates: (status) => {
    const params = status ? `?status=${status}` : '';
    return api.get(`/certificates/${params}`);
  },
  getPendingCertificates: () => api.get('/certificates/pending/'),
  uploadCertificate: (formData) => {
    return api.post('/certificates/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  approveCertificate: (id) => api.post(`/certificates/${id}/approve/`),
  rejectCertificate: (id, reason) => api.post(`/certificates/${id}/reject/`, { 
    action: 'reject',
    rejection_reason: reason 
  }),
  getCertificate: (id) => api.get(`/certificates/${id}/`)
};

// Rewards API calls
export const rewardsAPI = {
  getMyRewards: () => api.get('/rewards/my_rewards/'),
  getAllRewards: () => api.get('/rewards/'),
  useCredit: () => api.post('/rewards/use_credit/')
};

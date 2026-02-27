import api from './api';

export const adminAPI = {
  getLoginActivities: (params = {}) => api.get('/admin/login-activities/', { params }),
  getUsers: (params = {}) => api.get('/admin/users/', { params }),
  changeUserPassword: (userId, newPassword) => api.post(`/admin/users/${userId}/change_password/`, { new_password: newPassword }),
};

export default adminAPI;


import api from './axios';

export const userAPI = {
  getMe:             ()     => api.get('/users/me'),
  updateProfile:     (data) => api.put('/users/profile', data),
  changePassword:    (data) => api.put('/users/change-password', data),
  changeEmail:       (data) => api.put('/users/change-email', data),
  deactivateAccount: (data) => api.delete('/users/me', { data }),
};
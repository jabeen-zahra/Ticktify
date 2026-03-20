import api from './axios';

export const studentAPI = {
  getProfile:    ()              => api.get('/student/profile'),
  updateProfile: (data)          => api.put('/student/profile', data),
  getStats:      ()              => api.get('/student/stats'),

  getBookmarks:  (params)        => api.get('/student/bookmarks', { params }),
  addBookmark:   (id, data)      => api.post(`/student/bookmarks/${id}`, data),
  removeBookmark:(id)            => api.delete(`/student/bookmarks/${id}`),
  updateBookmark:(id, data)      => api.patch(`/student/bookmarks/${id}`, data),

  getNotifications: ()           => api.get('/student/notifications'),
  markAllRead:   ()              => api.patch('/student/notifications/read-all'),
  markOneRead:   (id)            => api.patch(`/student/notifications/${id}/read`),
};

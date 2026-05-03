import api from './axios';

export const studentAPI = {
  getProfile:    ()          => api.get('/student/profile'),
  updateProfile: (data)      => api.put('/student/profile', data),
  getStats:      ()          => api.get('/student/stats'),

  getBookmarks:   (params)   => api.get('/student/bookmarks', { params }),
  addBookmark:    (id, data) => api.post(`/student/bookmarks/${id}`, data),
  removeBookmark: (id)       => api.delete(`/student/bookmarks/${id}`),
  updateBookmark: (id, data) => api.patch(`/student/bookmarks/${id}`, data),

  getNotifications:  ()      => api.get('/notifications'),
  getUnreadCount:    ()      => api.get('/notifications/count'),
  markAllRead:       ()      => api.patch('/notifications/read-all'),
  markOneRead:       (id)    => api.patch(`/notifications/${id}/read`),
  deleteNotification:(id)    => api.delete(`/notifications/${id}`),
  deleteAllRead:     ()      => api.delete('/notifications/read'),
};
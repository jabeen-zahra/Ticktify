import api from './axios';

export const bookmarkAPI = {
  getAll:   ()           => api.get('/bookmarks'),
  add:      (id, data)   => api.post(`/bookmarks/${id}`, data),
  remove:   (id)         => api.delete(`/bookmarks/${id}`),
  update:   (id, data)   => api.patch(`/bookmarks/${id}`, data),
};

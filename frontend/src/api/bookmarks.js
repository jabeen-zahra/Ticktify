import api from './axios';

export const bookmarkAPI = {
  getAll:  (params)     => api.get('/bookmarks', { params }),
  check:   (id)         => api.get(`/bookmarks/check/${id}`),
  add:     (id, data)   => api.post(`/bookmarks/${id}`, data),
  remove:  (id)         => api.delete(`/bookmarks/${id}`),
  update:  (id, data)   => api.patch(`/bookmarks/${id}`, data),
};
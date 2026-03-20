import api from './axios';

export const opportunityAPI = {
  getAll:     (params) => api.get('/opportunities', { params }),
  getFeatured:()       => api.get('/opportunities/featured'),
  getOne:     (id)     => api.get(`/opportunities/${id}`),
  getMine:    ()       => api.get('/opportunities/organizer/my'),
  create:     (data)   => api.post('/opportunities', data),
  update:     (id, d)  => api.put(`/opportunities/${id}`, d),
  archive:    (id)     => api.delete(`/opportunities/${id}`),
};

import api from './axios';

export const organizerAPI = {
  getProfile:    ()        => api.get('/organizer/profile'),
  updateProfile: (data)    => api.put('/organizer/profile', data),
  getStats:      ()        => api.get('/organizer/stats'),
  getListings:   (params)  => api.get('/organizer/listings', { params }),
  createListing: (data)    => api.post('/organizer/listings', data),
  updateListing: (id, d)   => api.put(`/organizer/listings/${id}`, d),
  archiveListing:(id)      => api.delete(`/organizer/listings/${id}`),
};

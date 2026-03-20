import api from './axios';

export const adminAPI = {
  getStats:             ()           => api.get('/admin/stats'),
  getAllUsers:           (params)     => api.get('/admin/users', { params }),
  toggleUserActive:     (id)         => api.patch(`/admin/users/${id}/toggle-active`),
  getPendingOrganizers: ()           => api.get('/admin/organizers/pending'),
  reviewOrganizer:      (id, data)   => api.patch(`/admin/organizers/${id}/review`, data),
  getAllListings:        (params)     => api.get('/admin/listings', { params }),
  getPendingListings:   ()           => api.get('/admin/listings/pending'),
  reviewListing:        (id, data)   => api.patch(`/admin/listings/${id}/review`, data),
  toggleFeatured:       (id)         => api.patch(`/admin/listings/${id}/feature`),
  archiveListing:       (id)         => api.patch(`/admin/listings/${id}/archive`),
};

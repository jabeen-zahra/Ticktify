const express = require('express');
const router  = express.Router();
const {
  getStats, getAllUsers, toggleUserActive,
  getPendingOrganizers, reviewOrganizer,
  getAllListings, getPendingListings, reviewListing,
  toggleFeatured, archiveListing,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

// Stats
router.get('/stats', getStats);

// Users
router.get('/users',                    getAllUsers);
router.patch('/users/:id/toggle-active', toggleUserActive);

// Organizers
router.get('/organizers/pending',        getPendingOrganizers);
router.patch('/organizers/:id/review',   reviewOrganizer);

// Listings
router.get('/listings',                  getAllListings);
router.get('/listings/pending',          getPendingListings);
router.patch('/listings/:id/review',     reviewListing);
router.patch('/listings/:id/feature',    toggleFeatured);
router.patch('/listings/:id/archive',    archiveListing);

module.exports = router;

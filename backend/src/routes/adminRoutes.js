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

router.get('/stats', getStats);

router.get('/users',                     getAllUsers);
router.patch('/users/:id/toggle-active', toggleUserActive);

router.get('/organizers/pending',        getPendingOrganizers);
router.patch('/organizers/:id/review',   reviewOrganizer);

// IMPORTANT: /listings/pending before /listings/:id
router.get('/listings',                  getAllListings);
router.get('/listings/pending',          getPendingListings);
router.patch('/listings/:id/review',     reviewListing);
router.patch('/listings/:id/feature',    toggleFeatured);
router.patch('/listings/:id/archive',    archiveListing);

module.exports = router;
const express = require('express');
const router  = express.Router();
const {
  getStats, getPendingOrganizers, reviewOrganizer,
  getPendingListings, reviewListing, toggleFeatured,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/stats',                         getStats);
router.get('/organizers/pending',            getPendingOrganizers);
router.patch('/organizers/:id/review',       reviewOrganizer);
router.get('/listings/pending',              getPendingListings);
router.patch('/listings/:id/review',         reviewListing);
router.patch('/listings/:id/feature',        toggleFeatured);

module.exports = router;

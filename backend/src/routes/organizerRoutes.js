const express = require('express');
const router  = express.Router();
const {
  getProfile, updateProfile, getStats,
  getListings, createListing, updateListing, archiveListing,
} = require('../controllers/organizerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('organizer'));

router.get('/profile',       getProfile);
router.put('/profile',       updateProfile);
router.get('/stats',         getStats);
router.get('/listings',      getListings);
router.post('/listings',     createListing);
router.put('/listings/:id',  updateListing);
router.delete('/listings/:id', archiveListing);

module.exports = router;

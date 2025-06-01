const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const validateReview = require('../middleware/validateReview');
const authMiddleware = require('../middleware/auth');

// Ambil semua review untuk ambulans tertentu
router.get('/:ambulans_id', reviewController.getReviewsByAmbulans);

router.post('/', authMiddleware, validateReview, reviewController.addReview);

module.exports = router;

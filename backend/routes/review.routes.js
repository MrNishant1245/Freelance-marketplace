const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  submitReview,
  getUserReviews,
  getMyWrittenReviews,
  getReviewStatusForJob,
} = require('../controllers/review.controller');

// ── Specific routes BEFORE dynamic :userId — same pattern as job.routes.js ──
router.get('/my-written', protect, getMyWrittenReviews);
router.get('/job/:jobId/status', protect, getReviewStatusForJob);

// ── Submit a review (client or freelancer, on a completed job) ──────────────
router.post('/', protect, submitReview);

// ── Public: all reviews received by a user (shown on their profile) ─────────
router.get('/user/:userId', getUserReviews);

module.exports = router;

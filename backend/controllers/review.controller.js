const Review = require('../models/Review.model');
const Job = require('../models/Job.model');
const User = require('../models/User.model');

// ─── Helper: recompute a user's average rating + review count ───────────────
const recomputeUserRating = async (userId, role) => {
  const reviews = await Review.find({ reviewee: userId });
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  const profileField = role === 'freelancer' ? 'freelancerProfile' : 'clientProfile';

  await User.findByIdAndUpdate(userId, {
    $set: {
      [`${profileField}.rating`]: Math.round(avgRating * 10) / 10, // round to 1 decimal
      [`${profileField}.reviewCount`]: reviewCount,
    },
  });
};

// ─── Submit a review for a completed job ─────────────────────────────────────
// The reviewer must be either the job's client or its hired freelancer, the
// job must be 'completed', and they must be reviewing the *other* party.
const submitReview = async (req, res) => {
  try {
    const { jobId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    if (job.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review a job after it is marked completed.' });
    }

    const reviewerId = req.user.id;
    const isClient = job.client.toString() === reviewerId;
    const isFreelancer = job.hiredFreelancer && job.hiredFreelancer.toString() === reviewerId;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: 'You are not part of this job.' });
    }

    const revieweeId = isClient ? job.hiredFreelancer : job.client;
    const reviewerRole = isClient ? 'client' : 'freelancer';
    const revieweeRole = isClient ? 'freelancer' : 'client'; // role of the person being rated

    if (!revieweeId) {
      return res.status(400).json({ success: false, message: 'No counterpart to review on this job.' });
    }

    const review = await Review.create({
      job: jobId,
      reviewer: reviewerId,
      reviewee: revieweeId,
      reviewerRole,
      rating,
      comment,
    });

    await recomputeUserRating(revieweeId, revieweeRole);

    res.status(201).json({ success: true, message: 'Review submitted successfully.', data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this job.' });
    }
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

// ─── Get all reviews received by a specific user (public profile reviews) ───
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'firstName lastName profilePhoto')
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

// ─── Get reviews the logged-in user has written ──────────────────────────────
const getMyWrittenReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user.id })
      .populate('reviewee', 'firstName lastName')
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch your reviews.' });
  }
};

// ─── Check whether the logged-in user can/has reviewed a specific job ───────
// Used by the frontend to decide whether to show the "Rate" button.
const getReviewStatusForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const existingReview = await Review.findOne({ job: req.params.jobId, reviewer: req.user.id });

    const isClient = job.client.toString() === req.user.id;
    const isFreelancer = job.hiredFreelancer && job.hiredFreelancer.toString() === req.user.id;

    res.json({
      success: true,
      data: {
        canReview: job.status === 'completed' && (isClient || isFreelancer) && !existingReview,
        alreadyReviewed: !!existingReview,
        existingReview: existingReview || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to check review status.' });
  }
};

module.exports = {
  submitReview,
  getUserReviews,
  getMyWrittenReviews,
  getReviewStatusForJob,
};

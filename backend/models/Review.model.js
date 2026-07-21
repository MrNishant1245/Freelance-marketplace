const mongoose = require('mongoose');

// ─── Review schema ──────────────────────────────────────────────────────────
// A review is left by one party (client or freelancer) about the other,
// always tied to a specific completed job. Each job allows at most one
// review per direction (client→freelancer, freelancer→client) — enforced
// by the compound unique index below.
const reviewSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewerRole: {
      type: String,
      enum: ['client', 'freelancer'], // role of the person leaving the review
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// One review per (job, reviewer) — prevents the same person reviewing the
// same job twice, while still allowing both client and freelancer to each
// leave one review for that job.
reviewSchema.index({ job: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

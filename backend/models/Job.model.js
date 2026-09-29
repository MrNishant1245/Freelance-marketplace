const mongoose = require('mongoose');

// ─── Proposal sub-schema (a freelancer's bid on a job) ──────────────────────
const proposalSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      maxlength: 3000,
    },
    bidAmount: {
      type: Number,
      required: [true, 'Bid amount is required'],
      min: 0,
    },
    estimatedDays: {
      type: Number,
      min: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'accepted', 'rejected'],
      default: 'pending',
    },
    // Resume / sample work attached with the proposal
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, default: 'attachment' },
        fileType: { type: String, default: '' },
      },
    ],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ─── Milestone sub-schema ─────────────────────────────────────────────────────
const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'submitted', 'approved', 'paid', 'disputed'],
      default: 'pending',
    },
    disputeReason: { type: String, default: null },
    disputedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ─── Build Log sub-schema (Work-In-Progress timeline entries) ─────────────
const buildLogSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: { type: String, required: true, trim: true, maxlength: 2000 },
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, default: 'screenshot' },
        fileType: { type: String, default: 'image' },
      },
    ],
    checklist: [
      {
        task: { type: String, required: true, trim: true },
        completed: { type: Boolean, default: false },
      },
    ],
    progressPercentage: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

// ─── Sub-Hire sub-schema (Informal Team Splits) ───────────────────────────
const subHireSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: { type: String, required: true, trim: true },
    splitPercentage: { type: Number, required: true, min: 1, max: 99 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    invitedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ─── Main Job schema ───────────────────────────────────────────────────────────
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    skills: [{ type: String, trim: true }],

    budgetType: {
      type: String,
      enum: ['fixed', 'hourly'],
      default: 'fixed',
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: 0,
    },
    currency: {
      type: String,
      enum: ['INR', 'USD'],
      default: 'INR',
    },

    experienceLevel: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      default: 'intermediate',
    },
    duration: {
      type: String,
      enum: ['less-than-1-week', '1-4-weeks', '1-3-months', '3-6-months', '6-months-plus'],
    },

    // ── Relationships ──
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hiredFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    proposals: [proposalSchema],
    milestones: [milestoneSchema],
    buildLogs: [buildLogSchema],
    subHires: [subHireSchema],

    // ── Anti-Ghosting & Fair-Queue Settings ──
    noGhostDeposit: {
      amount: { type: Number, default: 500 },
      status: {
        type: String,
        enum: ['locked', 'claimed', 'released'],
        default: 'locked',
      },
      claimedAt: { type: Date, default: null },
    },
    lastClientActivityAt: { type: Date, default: Date.now },
    fairQueue: {
      enabled: { type: Boolean, default: true },
      windowHours: { type: Number, default: 2 },
      revealsAt: { type: Date },
      isRevealed: { type: Boolean, default: false },
    },

    // ── Work submission (freelancer's final delivered files) ──
    submissionFiles: [
      {
        url: { type: String, required: true },
        name: { type: String, default: 'file' },
        fileType: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    submissionNote: { type: String, trim: true, maxlength: 2000, default: '' },

    // ── Job lifecycle ──
    status: {
      type: String,
      enum: ['draft', 'active', 'in_progress', 'submitted', 'completed', 'closed', 'cancelled'],
      default: 'active',
    },

    // ── Moderation ──
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, trim: true },

    // ── Payment / escrow linkage ──
    payment: {
      status: {
        type: String,
        enum: ['unfunded', 'escrow_held', 'released', 'refunded', 'partially_released'],
        default: 'unfunded',
      },
      gateway: {
        type: String,
        enum: ['razorpay', 'stripe', null],
        default: null,
      },
      orderId: { type: String, default: null },      // Razorpay order id
      paymentId: { type: String, default: null },     // Razorpay payment id / Stripe intent id
      escrowAmount: { type: Number, default: 0 },
      releasedAmount: { type: Number, default: 0 },
      commissionRate: { type: Number, default: 10 },  // platform commission %
      fundedAt: { type: Date, default: null },
      releasedAt: { type: Date, default: null },
    },

    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
jobSchema.index({ client: 1 });
jobSchema.index({ hiredFreelancer: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ createdAt: -1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
jobSchema.virtual('proposalCount').get(function () {
  return this.proposals ? this.proposals.length : 0;
});

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;

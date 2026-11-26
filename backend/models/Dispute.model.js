const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    clientStatement: {
      text: { type: String, trim: true, default: '' },
      desiredResolution: { type: String, trim: true, default: '' },
      evidenceFiles: [
        {
          url: { type: String, required: true },
          name: { type: String, default: 'evidence' },
        },
      ],
      submittedAt: { type: Date, default: null },
    },
    freelancerStatement: {
      text: { type: String, trim: true, default: '' },
      desiredResolution: { type: String, trim: true, default: '' },
      evidenceFiles: [
        {
          url: { type: String, required: true },
          name: { type: String, default: 'evidence' },
        },
      ],
      submittedAt: { type: Date, default: null },
    },
    aiMediation: {
      neutralSummary: { type: String, default: '' },
      recommendedPayoutPct: { type: Number, default: 50 },
      recommendedRefundPct: { type: Number, default: 50 },
      reasoning: { type: String, default: '' },
      suggestedNextSteps: [{ type: String }],
      generatedAt: { type: Date, default: null },
      acceptedByClient: { type: Boolean, default: false },
      acceptedByFreelancer: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: [
        'statement_pending',
        'ai_proposed',
        'settled_by_ai',
        'escalated_to_admin',
        'resolved_by_admin',
        'cancelled',
      ],
      default: 'statement_pending',
    },
    finalDecision: {
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      payoutAmount: { type: Number, default: 0 },
      refundAmount: { type: Number, default: 0 },
      note: { type: String, default: '' },
      resolvedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

disputeSchema.index({ job: 1 });
disputeSchema.index({ status: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);

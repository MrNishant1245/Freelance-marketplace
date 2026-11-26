const mongoose = require('mongoose');

const vouchSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    workSampleUrl: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
    vouchers: [
      {
        voucher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        feedback: { type: String, trim: true, default: '' },
        vouchedAt: { type: Date, default: null },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    requiredVouchesCount: {
      type: Number,
      default: 2,
    },
  },
  { timestamps: true }
);

vouchSchema.index({ applicant: 1, skill: 1 });
vouchSchema.index({ 'vouchers.voucher': 1 });

module.exports = mongoose.model('Vouch', vouchSchema);

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    // Who paid
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Who received
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Related job
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    // Amounts
    amount:      { type: Number, required: true }, // Base job amount
    platformFee: { type: Number, required: true }, // 10% fee
    total:       { type: Number, required: true }, // amount + platformFee

    // Payment gateway details
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe'],
      required: true,
    },
    gatewayOrderId:   { type: String }, // Razorpay order_id / Stripe PaymentIntent id
    gatewayPaymentId: { type: String }, // Razorpay payment_id / Stripe charge id
    gatewaySignature: { type: String }, // Razorpay signature

    // Status flow: pending → paid → released / refunded
    status: {
      type: String,
      enum: ['pending', 'paid', 'in_escrow', 'released', 'refunded', 'failed'],
      default: 'pending',
      index: true,
    },

    // Timestamps for each status change
    paidAt:     { type: Date },
    releasedAt: { type: Date },
    refundedAt: { type: Date },

    // Notes
    notes: { type: String },
  },
  { timestamps: true }
);

// Virtual: formatted amount
transactionSchema.virtual('formattedTotal').get(function () {
  return `₹${this.total.toLocaleString('en-IN')}`;
});

module.exports = mongoose.model('Transaction', transactionSchema);

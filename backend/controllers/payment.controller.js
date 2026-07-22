const crypto      = require('crypto');
const Transaction = require('../models/Transaction.model');

// ✅ Lazy initialize — won't crash if keys are missing
let razorpay = null;
let stripe   = null;

const getRazorpay = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay keys not configured in .env');
    }
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe key not configured in .env');
    }
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

// ─── Create Razorpay Order (Escrow) ──────────────────────────────────────────
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, jobId, freelancerId } = req.body;
    if (!amount || !jobId || !freelancerId) {
      return res.status(400).json({ success: false, message: 'amount, jobId, freelancerId required.' });
    }

    const rz = getRazorpay();
    const platformFee = Math.round(amount * 0.1);
    const total       = amount + platformFee;

    const order = await rz.orders.create({
      amount:   total * 100, // paise mein
      currency: 'INR',
      notes:    { jobId, freelancerId, clientId: req.user.id, type: 'escrow' },
    });

    // ✅ Create pending transaction record
    const transaction = await Transaction.create({
      client:       req.user.id,
      freelancer:   freelancerId,
      job:          jobId,
      amount,
      platformFee,
      total,
      gateway:      'razorpay',
      gatewayOrderId: order.id,
      status:       'pending',
    });

    return res.json({
      success: true,
      data: {
        orderId:       order.id,
        transactionId: transaction._id,
        amount:        order.amount,
        currency:      order.currency,
        keyId:         process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create payment order.' });
  }
};

// ─── Verify Razorpay Payment ──────────────────────────────────────────────────
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionId } = req.body;

    // Signature verify
    const body             = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
    }

    // ✅ Update transaction to in_escrow
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        gatewayPaymentId: razorpay_payment_id,
        gatewaySignature: razorpay_signature,
        status:           'in_escrow',
        paidAt:           new Date(),
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: 'Payment verified. Amount held in escrow.',
      data:    { paymentId: razorpay_payment_id, transaction },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
};

// ─── Create Stripe Payment Intent ────────────────────────────────────────────
const createStripeIntent = async (req, res) => {
  try {
    const { amount, jobId, freelancerId } = req.body;
    if (!amount || !jobId || !freelancerId) {
      return res.status(400).json({ success: false, message: 'amount, jobId, freelancerId required.' });
    }

    const st          = getStripe();
    const platformFee = Math.round(amount * 0.1);
    const total       = amount + platformFee;

    const paymentIntent = await st.paymentIntents.create({
      amount:         total * 100,
      currency:       'usd',
      capture_method: 'manual', // hold in escrow
      metadata:       { jobId, freelancerId, clientId: req.user.id, type: 'escrow' },
    });

    // ✅ Create pending transaction record
    const transaction = await Transaction.create({
      client:          req.user.id,
      freelancer:      freelancerId,
      job:             jobId,
      amount,
      platformFee,
      total,
      gateway:         'stripe',
      gatewayOrderId:  paymentIntent.id,
      status:          'pending',
    });

    return res.json({
      success: true,
      data: {
        clientSecret:  paymentIntent.client_secret,
        intentId:      paymentIntent.id,
        transactionId: transaction._id,
      },
    });
  } catch (error) {
    console.error('Stripe intent error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create payment intent.' });
  }
};

// ─── Release Escrow Payment ───────────────────────────────────────────────────
const releasePayment = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const transaction = await Transaction.findById(transactionId)
      .populate('client freelancer job');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    if (transaction.status !== 'in_escrow') {
      return res.status(400).json({ success: false, message: 'Payment is not in escrow.' });
    }

    // Verify caller is the client
    if (transaction.client._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the client can release payment.' });
    }

    if (transaction.gateway === 'stripe') {
      const st = getStripe();
      await st.paymentIntents.capture(transaction.gatewayOrderId);
    }
    // Razorpay: payment is already captured, just update our record
    // (In production, you'd trigger a payout via Razorpay X here)

    // ✅ Update transaction status
    transaction.status     = 'released';
    transaction.releasedAt = new Date();
    await transaction.save();

    return res.json({
      success: true,
      message: 'Payment released to freelancer.',
      data:    transaction,
    });
  } catch (error) {
    console.error('Release payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to release payment.' });
  }
};

// ─── Refund Payment ───────────────────────────────────────────────────────────
const refundPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    if (!['in_escrow', 'paid'].includes(transaction.status)) {
      return res.status(400).json({ success: false, message: 'Transaction cannot be refunded.' });
    }

    if (transaction.gateway === 'stripe') {
      const st = getStripe();
      await st.refunds.create({ payment_intent: transaction.gatewayOrderId });
    }

    if (transaction.gateway === 'razorpay') {
      const rz = getRazorpay();
      await rz.payments.refund(transaction.gatewayPaymentId, {
        amount: transaction.total * 100,
      });
    }

    // ✅ Update transaction status
    transaction.status     = 'refunded';
    transaction.refundedAt = new Date();
    await transaction.save();

    return res.json({
      success: true,
      message: 'Refund processed successfully.',
      data:    transaction,
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ success: false, message: 'Failed to process refund.' });
  }
};

// ─── Get Payment History ──────────────────────────────────────────────────────
// ✅ NEW: Returns all transactions for current user (as client OR freelancer)
const getPaymentHistory = async (req, res) => {
  try {
    const { role } = req.query; // 'client' | 'freelancer'
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 20;
    const skip     = (page - 1) * limit;

    let filter = {};
    if (req.user.role !== 'admin') {
      filter = role === 'freelancer'
        ? { freelancer: req.user.id }
        : { client: req.user.id };
    } else {
      if (role === 'freelancer') {
        filter = { freelancer: { $exists: true } };
      } else if (role === 'client') {
        filter = { client: { $exists: true } };
      }
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('client',     'firstName lastName email profilePhoto')
        .populate('freelancer', 'firstName lastName email profilePhoto')
        .populate('job',        'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    // Summary stats
    const stats = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id:          null,
          totalSpent:   { $sum: { $cond: [{ $eq: ['$status', 'released'] }, '$total', 0] } },
          totalEarned:  { $sum: { $cond: [{ $eq: ['$status', 'released'] }, '$amount', 0] } },
          inEscrow:     { $sum: { $cond: [{ $eq: ['$status', 'in_escrow'] }, '$total', 0] } },
          totalCount:   { $sum: 1 },
        },
      },
    ]);

    return res.json({
      success: true,
      data: {
        transactions,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        stats: stats[0] || { totalSpent: 0, totalEarned: 0, inEscrow: 0, totalCount: 0 },
      },
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── Get Single Transaction ───────────────────────────────────────────────────
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('client',     'firstName lastName email')
      .populate('freelancer', 'firstName lastName email')
      .populate('job',        'title status');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    // Only client or freelancer can view
    const isAllowed =
      transaction.client._id.toString()     === req.user.id.toString() ||
      transaction.freelancer._id.toString() === req.user.id.toString();

    if (!isAllowed) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripeIntent,
  releasePayment,
  refundPayment,
  getPaymentHistory, // ✅ NEW
  getTransaction,    // ✅ NEW
};

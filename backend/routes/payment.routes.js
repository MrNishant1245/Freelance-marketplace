const express = require('express');
const router  = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createStripeIntent,
  releasePayment,
  refundPayment,
  getPaymentHistory, // ✅ NEW
  getTransaction,    // ✅ NEW
} = require('../controllers/payment.controller');

// Razorpay
router.post('/razorpay/order',  protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

// Stripe
router.post('/stripe/intent', protect, createStripeIntent);

// Escrow actions
router.post('/release', protect, releasePayment);
router.post('/refund',  protect, refundPayment);

// ✅ NEW: Payment history & details
router.get('/history',  protect, getPaymentHistory); // GET /api/payment/history?role=client
router.get('/:id',      protect, getTransaction);    // GET /api/payment/:transactionId

module.exports = router;

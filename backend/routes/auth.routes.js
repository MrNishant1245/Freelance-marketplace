const express = require('express');
const router = express.Router();
const {
  register, login, refreshToken, logout, verifyEmail,
  resendVerificationEmail, forgotPassword, resetPassword,
  changePassword, getMe, verify2FA, resend2FA,
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const {
  validate, registerRules, loginRules, forgotPasswordRules,
  resetPasswordRules, changePasswordRules,
} = require('../middlewares/validation.middleware');

// Public routes
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, validate, resetPassword);
router.post('/verify-2fa', verify2FA);
router.post('/resend-2fa', resend2FA);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.post('/logout', logout);
router.put('/change-password', changePasswordRules, validate, changePassword);

module.exports = router;

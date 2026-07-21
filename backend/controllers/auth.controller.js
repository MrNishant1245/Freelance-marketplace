const crypto = require('crypto');
const User = require('../models/User.model');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../utils/jwt.utils');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
  sendTwoFactorCodeEmail,
} = require('../utils/email.utils');

// ─── Register ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const allowedRoles = ['freelancer', 'client'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be freelancer or client.' });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      // ✅ In dev mode, auto-verify
      isEmailVerified: process.env.NODE_ENV === 'development' ? true : false,
      freelancerProfile: role === 'freelancer' ? {} : undefined,
      clientProfile: role === 'client' ? {} : undefined,
    });

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email (non-blocking) — only in production
    if (process.env.NODE_ENV !== 'development') {
      sendVerificationEmail(user, verificationToken).catch((err) =>
        console.error('Verification email failed:', err.message)
      );
    }

    return res.status(201).json({
      success: true,
      message: process.env.NODE_ENV === 'development'
        ? 'Account created successfully. You can now sign in.'
        : 'Account created successfully. Please verify your email before signing in.',
      data: { user: user.toPublicJSON() },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: `Account suspended: ${user.suspendedReason || 'Contact support.'}`,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // ✅ In dev mode, skip email verification
    if (process.env.NODE_ENV !== 'development' && !user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before signing in.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    // ✅ If Two-Factor authentication is enabled, generate OTP and return early
    if (user.isTwoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
      user.twoFactorCode = hashedOtp;
      user.twoFactorExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      console.log(`[2FA OTP FOR ${user.email}]: ${otp}`);

      // Send verification email
      sendTwoFactorCodeEmail(user, otp).catch((err) =>
        console.error('Two-factor email failed to send:', err.message)
      );

      return res.json({
        success: true,
        twoFactorRequired: true,
        email: user.email,
        message: 'Two-step verification code sent to your email.'
      });
    }

    user.lastLogin = new Date();

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    if (user.refreshTokens.length >= 5) {
      user.refreshTokens = user.refreshTokens.slice(-4);
    }
    user.refreshTokens.push({ token: hashToken(refreshToken) });
    await user.save();

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toPublicJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ─── Verify 2FA OTP ────────────────────────────────────────────────────────────
const verify2FA = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.twoFactorCode || !user.twoFactorExpires) {
      return res.status(400).json({ success: false, message: 'No active two-step verification request found.' });
    }

    if (user.twoFactorExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    const hashedOtp = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    if (user.twoFactorCode !== hashedOtp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code.' });
    }

    // Code matches, clear the OTP fields and log in
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    user.lastLogin = new Date();

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    if (user.refreshTokens.length >= 5) {
      user.refreshTokens = user.refreshTokens.slice(-4);
    }
    user.refreshTokens.push({ token: hashToken(refreshToken) });
    await user.save();

    return res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toPublicJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ success: false, message: 'Server error during two-step verification.' });
  }
};

// ─── Resend 2FA OTP ────────────────────────────────────────────────────────────
const resend2FA = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    user.twoFactorCode = hashedOtp;
    user.twoFactorExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(`[RESENT 2FA OTP FOR ${user.email}]: ${otp}`);

    await sendTwoFactorCodeEmail(user, otp);

    return res.json({ success: true, message: 'Verification code resent to your email.' });
  } catch (error) {
    console.error('Resend 2FA error:', error);
    res.status(500).json({ success: false, message: 'Failed to resend verification code.' });
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token required.' });
    }

    const decoded = verifyRefreshToken(token);
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      _id: decoded.id,
      'refreshTokens.token': hashedToken,
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== hashedToken);
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push({ token: hashToken(newRefreshToken) });
    await user.save();

    return res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      const hashedToken = hashToken(token);
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { refreshTokens: { token: hashedToken } },
      });
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during logout.' });
  }
};

// ─── Verify Email ─────────────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification link. Please request a new one.',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    sendWelcomeEmail(user).catch(console.error);

    return res.json({ success: true, message: 'Email verified successfully! Your account is now active.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during email verification.' });
  }
};

// ─── Resend Verification Email ────────────────────────────────────────────────
const resendVerificationEmail = async (req, res) => {
  try {
    const email = req.body?.email?.toLowerCase();
    let user;

    if (req.user?.id) {
      user = await User.findById(req.user.id);
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists for that email, a verification link has been sent.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'This email is already verified.' });
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires - Date.now() > 23.9 * 60 * 60 * 1000) {
      return res.status(429).json({
        success: false,
        message: 'Please wait a few minutes before requesting another verification email.',
      });
    }

    const token = user.generateEmailVerificationToken();
    await user.save();
    await sendVerificationEmail(user, token);

    return res.json({ success: true, message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to resend verification email.' });
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, we\'ve sent a reset link.',
      });
    }

    const token = user.generatePasswordResetToken();
    await user.save();
    await sendPasswordResetEmail(user, token);

    return res.json({
      success: true,
      message: 'If an account with that email exists, we\'ve sent a reset link.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process password reset request.' });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link. Please request a new one.',
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    sendPasswordChangedEmail(user).catch(console.error);

    return res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during password reset.' });
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();

    sendPasswordChangedEmail(user).catch(console.error);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while changing password.' });
  }
};

// ─── Get current user ─────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, data: { user: user.toPublicJSON() } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  verify2FA,
  resend2FA,
};

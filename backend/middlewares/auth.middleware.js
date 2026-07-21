const { verifyAccessToken } = require('../utils/jwt.utils');
const User = require('../models/User.model');

// ─── Protect: require valid JWT ───────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password -refreshTokens');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: `Account suspended: ${user.suspendedReason || 'Contact support.'}`,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated.' });
    }

    req.user = { id: user._id.toString(), role: user.role, email: user.email };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    return res.status(500).json({ success: false, message: 'Authentication error.' });
  }
};

// ─── Authorize: role-based access ────────────────────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}.`,
      });
    }
    next();
  };
};

// ─── Optional auth: attach user if token present ─────────────────────────────
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
  } catch {
    // No-op — token invalid or absent
  }
  next();
};

// ─── Email verified guard ─────────────────────────────────────────────────────
const requireEmailVerified = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('isEmailVerified');
  if (!user?.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address to access this feature.',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }
  next();
};

module.exports = { protect, authorize, optionalAuth, requireEmailVerified };

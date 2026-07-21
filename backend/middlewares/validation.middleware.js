const { body, validationResult } = require('express-validator');

// ─── Run validations and return errors ───────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Rules ────────────────────────────────────────────────────────────────────
const registerRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and a number'),
  body('role').isIn(['freelancer', 'client']).withMessage('Role must be freelancer or client'),
];

const loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordRules = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
];

const resetPasswordRules = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and a number'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and a number'),
];

const updateProfileRules = [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('phone').optional().trim(),
  body('location.country').optional().trim(),
  body('location.city').optional().trim(),
];

const freelancerProfileRules = [
  body('title').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('bio').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
  body('skills').optional({ checkFalsy: true }).isArray().withMessage('Skills must be an array'),
  body('hourlyRate').optional({ checkFalsy: true }).isNumeric().isFloat({ min: 0 }),
  body('experienceLevel').optional({ checkFalsy: true }).isIn(['entry', 'intermediate', 'expert']),
  body('availability').optional({ checkFalsy: true }).isIn(['full-time', 'part-time', 'not-available']),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
  updateProfileRules,
  freelancerProfileRules,
};

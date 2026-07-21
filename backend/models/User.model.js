const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ─── Freelancer-specific sub-schema ─────────────────────────────────────────
const freelancerProfileSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 100 },
  bio: { type: String, trim: true, maxlength: 2000 },
  skills: [{ type: String, trim: true }],
  hourlyRate: { type: Number, min: 0 },
  experienceLevel: {
    type: String,
    enum: ['entry', 'intermediate', 'expert'],
    default: 'entry',
  },
  portfolio: [
    {
      title: { type: String, required: true, trim: true },
      description: { type: String, trim: true },
      url: { type: String, trim: true },
      imageUrl: { type: String },
      technologies: [String],
      createdAt: { type: Date, default: Date.now },
    },
  ],
  education: [
    {
      institution: String,
      degree: String,
      field: String,
      startYear: Number,
      endYear: Number,
    },
  ],
  certifications: [
    {
      name: String,
      issuer: String,
      year: Number,
      url: String,
    },
  ],
  experience: [
    {
      company: { type: String, trim: true },
      role: { type: String, trim: true },
      description: { type: String, trim: true },
      startDate: { type: String, trim: true },
      endDate: { type: String, trim: true },
    }
  ],
  aboutMeTags: [{ type: String, trim: true }],
  socials: {
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  availabilityHours: { type: String, default: '40 hrs / week' },
  availabilityType: { type: String, default: 'Remote / Work from Anywhere' },
  availabilityContract: { type: String, default: 'Open to Contract' },
  languages: [
    {
      language: String,
      proficiency: { type: String, enum: ['basic', 'conversational', 'fluent', 'native'] },
    },
  ],
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'not-available'],
    default: 'full-time',
  },
  totalEarnings: { type: Number, default: 0 },
  completedJobs: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
}, { _id: false });

// ─── Client-specific sub-schema ──────────────────────────────────────────────
const clientProfileSchema = new mongoose.Schema({
  companyName: { type: String, trim: true },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
  },
  industry: { type: String, trim: true },
  website: { type: String, trim: true },
  bio: { type: String, trim: true, maxlength: 1000 },
  totalSpent: { type: Number, default: 0 },
  postedJobs: { type: Number, default: 0 },
  hiredFreelancers: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
}, { _id: false });

// ─── Main User schema ─────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // this already creates an index — no need for userSchema.index({ email: 1 })
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['freelancer', 'client', 'admin'],
      required: [true, 'Role is required'],
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    profilePhotoPublicId: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      country: String,
      state: String,
      city: String,
    },
    timezone: { type: String },

    // Role-specific profiles
    freelancerProfile: freelancerProfileSchema,
    clientProfile: clientProfileSchema,

    // Saved / bookmarked jobs (freelancer feature)
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

    // Auth & verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Two factor authentication
    isTwoFactorEnabled: { type: Boolean, default: false },
    twoFactorCode: String,
    twoFactorExpires: Date,

    // Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Refresh tokens (stored hashed)
    refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }],

    // Account status
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    suspendedReason: String,
    lastLogin: Date,

    // Onboarding
    isProfileComplete: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// email index is already created by unique: true above, so removed it here
userSchema.index({ role: 1 });
userSchema.index({ 'freelancerProfile.skills': 1 });
userSchema.index({ createdAt: -1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ─── Pre-save: hash password ──────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Methods ──────────────────────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.refreshTokens;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

// backend/seedAdmin.js
//
// Run this once to create an admin account in your database.
// Usage:  node seedAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.model');

// ── EDIT THESE DETAILS BEFORE RUNNING ───────────────────────────────────────
const ADMIN_DETAILS = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@freelancemarket.com',
  password: 'Admin@1234',   // meets the 8-char minlength rule in your User model
  role: 'admin',
};
// ─────────────────────────────────────────────────────────────────────────────

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_DETAILS.email });
    if (existing) {
      console.log('⚠️  An account with this email already exists:');
      console.log(`   Email: ${existing.email}`);
      console.log(`   Role:  ${existing.role}`);
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log('✅ Existing account role updated to "admin".');
      } else {
        console.log('ℹ️  This account is already an admin. Nothing changed.');
      }
      process.exit(0);
    }

    const admin = new User({
      firstName: ADMIN_DETAILS.firstName,
      lastName: ADMIN_DETAILS.lastName,
      email: ADMIN_DETAILS.email,
      password: ADMIN_DETAILS.password, // will be hashed automatically by the pre-save hook
      role: ADMIN_DETAILS.role,
      isEmailVerified: true,   // skip email verification for admin
      isActive: true,
      isProfileComplete: true,
    });

    await admin.save();

    console.log('🎉 Admin account created successfully!');
    console.log('-----------------------------------');
    console.log(`Email:    ${ADMIN_DETAILS.email}`);
    console.log(`Password: ${ADMIN_DETAILS.password}`);
    console.log('-----------------------------------');
    console.log('You can now log in at /login with role = Admin');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin account:', err.message);
    process.exit(1);
  }
};

seedAdmin();

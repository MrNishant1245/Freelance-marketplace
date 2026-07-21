// backend/disable2FAAll.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.model');

const disableAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await User.updateMany({}, { $set: { isTwoFactorEnabled: false } });
    console.log(`✅ Updated ${result.modifiedCount} accounts. Two-Factor Authentication has been disabled for all users.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating accounts:', err.message);
    process.exit(1);
  }
};

disableAll();

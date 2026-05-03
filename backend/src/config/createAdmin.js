require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log(`⚠️  Admin already exists: ${existing.email}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const admin = await User.create({
    name:     'Ticktify Admin',
    email:    'admin@ticktify.pk',
    password: 'Admin@123456',
    role:     'admin',
    isActive: true,
  });

  console.log('\n✅ Admin account created!');
  console.log('─────────────────────────────────');
  console.log(`   Email   : ${admin.email}`);
  console.log(`   Password: Admin@123456`);
  console.log('─────────────────────────────────');
  console.log('⚠️  Change this password after first login!\n');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
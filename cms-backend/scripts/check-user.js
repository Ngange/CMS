const mongoose = require('mongoose');
const User = require('../models/user.model');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cms-db';

async function checkUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'bsallah@cms.com';
    const user = await User.findOne({ email }).populate('role');

    if (user) {
      console.log('\n✅ User found:');
      console.log('Email:', user.email);
      console.log('Full Name:', user.fullName);
      console.log('Role:', user.role?.name);
      console.log('Is Active:', user.isActive);
      console.log('Created At:', user.createdAt);

      // Test password
      const testPassword = 'P@ssw0rd';
      const passwordMatch = await user.comparePassword(testPassword);
      console.log(`\nPassword "${testPassword}" matches:`, passwordMatch);
    } else {
      console.log('\n❌ User not found with email:', email);

      // List all users
      console.log('\nAll users in database:');
      const allUsers = await User.find().populate('role').select('-password');
      allUsers.forEach((u) => {
        console.log(
          `- ${u.email} (${u.fullName}) - Role: ${u.role?.name} - Active: ${u.isActive}`
        );
      });
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUser();

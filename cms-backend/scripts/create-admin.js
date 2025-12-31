require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Role = require('../models/role.model');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_db';

const run = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Prefer a SuperAdmin role if it exists; otherwise fall back to the first role.
    const superAdminRole = await Role.findOne({ name: 'SuperAdmin' });
    const fallbackRole = await Role.findOne();
    const roleId = superAdminRole?._id || fallbackRole?._id;

    if (!roleId) {
      console.error('No roles found. Please run init-roles.js first.');
      process.exit(1);
    }

    const email = 'admin@cms.com';
    const existing = await User.findOne({ email });

    if (existing) {
      console.log('User already exists:', email);
      process.exit(0);
    }

    await User.create({
      fullName: 'Administrator',
      email,
      password: 'Admin123!',
      role: roleId,
      isActive: true,
    });

    console.log('Admin user created:', email);
  } catch (err) {
    console.error('Failed to create admin user:', err.message || err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

run();

const mongoose = require('mongoose');
const Role = require('../models/role.model');
require('dotenv').config();

const ROLES_CONFIG = [
  {
    name: 'SuperAdmin',
    description: 'Full system access with all permissions',
    permissions: [
      'user:create',
      'user:read',
      'user:update',
      'user:delete',
      'user:activate',
      'role:create',
      'role:read',
      'role:update',
      'role:delete',
      'article:create',
      'article:read',
      'article:update',
      'article:delete',
      'article:publish',
      'article:unpublish',
      'article:view-all',
      'article:approve',
      'media:upload',
      'media:read',
      'media:update',
      'media:delete',
      'dashboard:view',
    ],
    isSystemRole: true,
  },
  {
    name: 'Manager',
    description: 'Manages content and publications',
    permissions: [
      'article:create',
      'article:read',
      'article:update',
      'article:delete',
      'article:publish',
      'article:unpublish',
      'article:view-all',
      'article:approve',
      'media:upload',
      'media:read',
      'media:update',
      'media:delete',
      'dashboard:view',
    ],
    isSystemRole: true,
  },
  {
    name: 'Contributor',
    description: 'Creates and edits own content',
    permissions: [
      'article:create',
      'article:read:own',
      'article:update:own',
      'article:delete:own',
      'article:submit',
      'media:upload:own',
      'media:read:own',
    ],
    isSystemRole: true,
  },
  {
    name: 'Viewer',
    description: 'Read-only access to published content',
    permissions: ['article:read:published', 'media:read:published'],
    isSystemRole: true,
  },
];

async function seedRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_db',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log(' Connected to MongoDB');

    // Clear existing roles
    await Role.deleteMany({});
    console.log('  Cleared existing roles');

    // Create roles
    for (const roleData of ROLES_CONFIG) {
      const role = new Role(roleData);
      await role.save();
      console.log(` Created role: ${roleData.name}`);
    }

    // Display all roles
    const allRoles = await Role.find({});
    console.log(' All Roles in Database:');
    console.log('='.repeat(50));

    allRoles.forEach((role) => {
      console.log(`  ${role.name}:`);
      console.log(`   ${role.description}`);
      console.log(`   Permissions (${role.permissions.length}):`);
      role.permissions.forEach((perm, index) => {
        console.log(`     ${index + 1}. ${perm}`);
      });
    });

    console.log('Role seeding completed successfully!');
    console.log('Next steps:');
    console.log('1. Register your first SuperAdmin user');
    console.log('2. Start using the API with role-based access');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
}

seedRoles();

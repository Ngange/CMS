const mongoose = require('mongoose');
const Role = require('../Models/role.model');
require('dotenv').config();

const initializeRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const systemRoles = [
      {
        name: 'SuperAdmin',
        description: 'Super Administrator with all permissions',
        permissions: [
          { resource: 'user', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'role', actions: ['create', 'read', 'update', 'delete'] },
          {
            resource: 'article',
            actions: ['create', 'read', 'update', 'delete', 'publish'],
          },
        ],
        isSystemRole: true,
      },
      {
        name: 'Manager',
        description: 'Manager with content management permissions',
        permissions: [
          {
            resource: 'article',
            actions: ['create', 'read', 'update', 'delete', 'publish'],
          },
        ],
        isSystemRole: true,
      },
      {
        name: 'Contributor',
        description: 'Contributor with basic content creation permissions',
        permissions: [
          { resource: 'article', actions: ['create', 'read', 'update'] },
        ],
        isSystemRole: true,
      },
      {
        name: 'Viewer',
        description: 'Viewer with read-only permissions',
        permissions: [{ resource: 'article', actions: ['read'] }],
        isSystemRole: true,
      },
    ];

    console.log('Deleting existing system roles...');
    await Role.deleteMany({
      name: { $in: ['SuperAdmin', 'Manager', 'Contributor', 'Viewer'] },
    });

    console.log('Creating new system roles...');
    for (const roleData of systemRoles) {
      const role = await Role.create(roleData);
      console.log(`Created role: ${role.name} (ID: ${role._id})`);
    }

    // Verify roles were created
    const allRoles = await Role.find({ isSystemRole: true });
    console.log(`Total system roles in database: ${allRoles.length}`);
    allRoles.forEach((role) => {
      console.log(`  - ${role.name}`);
    });

    console.log('System roles initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing roles:', error);
    process.exit(1);
  }
};

initializeRoles();

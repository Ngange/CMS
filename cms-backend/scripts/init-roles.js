const mongoose = require('mongoose');
const Role = require('../models/role.model');
require('dotenv').config();

const initializeRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

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

    for (const roleData of systemRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`Created role: ${roleData.name}`);
      }
    }

    console.log('System roles initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing roles:', error);
    process.exit(1);
  }
};

initializeRoles();

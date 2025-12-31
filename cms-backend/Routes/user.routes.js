const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../Middleware/auth.middleware');
const { checkPermission } = require('../Middleware/authorization.middleware');
const upload = require('../Middleware/upload.middleware');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
} = require('../Controllers/user.controller');

// All routes require authentication
router.use(authenticateToken);

// Get all users (SuperAdmin only)
router.get('/', checkPermission('user', 'read'), getAllUsers);

// Create user (SuperAdmin only)
router.post('/', checkPermission('user', 'create'), createUser);

// Get user by ID
router.get('/:id', getUserById);

// Update user profile (own profile or SuperAdmin)
router.put('/:id', upload.single('profilePhoto'), updateUser);

// Toggle user status (activate/deactivate - SuperAdmin only)
router.patch(
  '/:id/status',
  checkPermission('user', 'update'),
  toggleUserStatus
);

// Delete user (SuperAdmin only)
router.delete('/:id', checkPermission('user', 'delete'), deleteUser);

module.exports = router;

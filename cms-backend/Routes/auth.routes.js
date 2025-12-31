const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../Middleware/auth.middleware');
const {
  register,
  login,
  logout,
  getSystemRoles,
  getProfile,
  updateProfile,
  changePassword,
} = require('../Controllers/auth.controller');
const {
  refreshAccessToken,
} = require('../Controllers/refresh-token.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.get('/system-roles', getSystemRoles);

// Protected routes
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

module.exports = router;

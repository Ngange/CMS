const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { register, login, logout } = require('../controllers/auth.controller');
const {
  refreshAccessToken,
} = require('../controllers/refresh-token.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);

// Protected routes
router.post('/logout', authenticateToken, logout);

module.exports = router;

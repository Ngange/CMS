const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const {
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require('../controllers/profile.controller');

// All profile routes require authentication
router.use(authenticateToken);

router.get('/', getMyProfile);
router.put('/', updateMyProfile);
router.post('/change-password', changePassword);

module.exports = router;

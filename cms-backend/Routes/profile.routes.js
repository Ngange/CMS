const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../Middleware/auth.middleware');
const upload = require('../Middleware/upload.middleware');
const {
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require('../Controllers/profile.controller');

// All profile routes require authentication
router.use(authenticateToken);

router.get('/', getMyProfile);
router.put('/', upload.single('profilePhoto'), updateMyProfile);
router.post('/change-password', changePassword);

module.exports = router;

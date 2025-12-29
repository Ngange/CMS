const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/authorization.middleware');
const {
  getAllRoles,
  createRole,
  updateRole,
} = require('../controllers/role.controller');

router.get('/', authenticateToken, getAllRoles);
router.post(
  '/',
  authenticateToken,
  checkPermission('role', 'create'),
  createRole
);
router.put(
  '/:roleId',
  authenticateToken,
  checkPermission('role', 'update'),
  updateRole
);

module.exports = router;

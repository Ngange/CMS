const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/authorization.middleware');
const {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
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

router.delete(
  '/:roleId',
  authenticateToken,
  checkPermission('role', 'delete'),
  deleteRole
);

module.exports = router;

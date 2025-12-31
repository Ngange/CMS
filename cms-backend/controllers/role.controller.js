const PermissionService = require('../services/permission.service');

const getAllRoles = async (req, res) => {
  try {
    const roles = await PermissionService.getAllRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const role = await PermissionService.createRole({
      name,
      description,
      permissions,
      isSystemRole: false,
    });
    res.status(201).json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { name, description, permissions } = req.body;

    const role = await PermissionService.updateRole(roleId, {
      name,
      description,
      permissions,
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const deleted = await PermissionService.deleteRole(roleId);

    if (!deleted) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
};

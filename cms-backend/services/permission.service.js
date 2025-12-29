const Role = require('../models/role.model');

class PermissionService {
  static async createRole(roleData) {
    const role = new Role(roleData);
    await role.save();
    return role;
  }

  static async updateRole(roleId, updateData) {
    const role = await Role.findByIdAndUpdate(roleId, updateData, {
      new: true,
      runValidators: true,
    });
    return role;
  }

  static async getAllRoles() {
    return await Role.find();
  }

  static async getRoleById(roleId) {
    return await Role.findById(roleId);
  }

  static async hasPermission(userRole, resource, action) {
    if (!userRole || !userRole.permissions) return false;

    return userRole.permissions.some(
      (perm) => perm.resource === resource && perm.actions.includes(action)
    );
  }
}

module.exports = PermissionService;

const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;

      // Check if user has the required permission
      const hasPermission = userRole.permissions.some(
        (perm) => perm.resource === resource && perm.actions.includes(action)
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: `Access denied. Required permission: ${resource}:${action}`,
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Authorization check failed' });
    }
  };
};

module.exports = { checkPermission };

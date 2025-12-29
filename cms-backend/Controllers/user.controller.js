const User = require('../models/user.model');
const Role = require('../models/role.model');

// Helper function to check SuperAdmin permission
const isSuperAdmin = (user) => user.role.name === 'SuperAdmin';

// Get all users (SuperAdmin only)
const getAllUsers = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({
        message: 'Access denied. SuperAdmin only.',
      });
    }

    const users = await User.find()
      .populate('role', 'name description permissions')
      .select('-password');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get any user by ID (SuperAdmin only)
const getUserById = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({
        message: 'Access denied. SuperAdmin only.',
      });
    }

    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate('role', 'name description permissions')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update any user (SuperAdmin only)
const updateUser = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({
        message: 'Access denied. SuperAdmin only.',
      });
    }

    const userId = req.params.id;
    const updates = req.body;

    // Prevent updating own account through this endpoint
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        message: 'Use profile endpoints to update your own account',
      });
    }

    // Filter allowed updates
    const allowedUpdates = [
      'fullName',
      'email',
      'role',
      'isActive',
      'profilePhoto',
    ];
    const filteredUpdates = {};

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Validate role if being updated
    if (filteredUpdates.role) {
      const role = await Role.findById(filteredUpdates.role);
      if (!role) {
        return res.status(400).json({ message: 'Invalid role' });
      }
    }

    // Email uniqueness check
    if (filteredUpdates.email) {
      const existingUser = await User.findOne({
        email: filteredUpdates.email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
      new: true,
      runValidators: true,
    })
      .populate('role', 'name description permissions')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Deactivate/Activate user (SuperAdmin only)
const toggleUserStatus = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({
        message: 'Access denied. SuperAdmin only.',
      });
    }

    const userId = req.params.id;
    const { isActive } = req.body;

    // Prevent deactivating own account
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        message: 'Cannot deactivate your own account',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    )
      .populate('role', 'name description permissions')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user (SuperAdmin only)
const deleteUser = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({
        message: 'Access denied. SuperAdmin only.',
      });
    }

    const userId = req.params.id;

    // Prevent deleting own account
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        message: 'Cannot delete your own account',
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
};

const User = require('../models/user.model');
const Role = require('../models/role.model');
const bcrypt = require('bcryptjs');

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

// Create user (SuperAdmin only)
const createUser = async (req, res) => {
  try {
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({
        message: 'Access denied. SuperAdmin only.',
      });
    }

    const {
      fullName,
      email,
      password,
      role,
      isActive = true,
      profilePhoto,
    } = req.body;

    if (!fullName || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: 'fullName, email, password, and role are required' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    const roleDoc = await Role.findById(role);
    if (!roleDoc) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const user = new User({
      fullName,
      email,
      password,
      role,
      isActive,
      profilePhoto,
    });

    await user.save();

    const populated = await User.findById(user._id)
      .populate('role', 'name description permissions')
      .select('-password');

    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error, surface a friendly message
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      const message =
        field === 'email'
          ? 'Email already exists'
          : `Duplicate value for ${field}. Check existing records or indexes.`;
      return res.status(400).json({ message });
    }
    res.status(400).json({ message: error.message });
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
      'password',
    ];
    const filteredUpdates = {};

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Handle file upload
    if (req.file) {
      filteredUpdates.profilePhoto = req.file.path;
    }

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

    // Hash password if provided (findByIdAndUpdate doesn't trigger pre-save hook)
    if (filteredUpdates.password) {
      const salt = await bcrypt.genSalt(10);
      filteredUpdates.password = await bcrypt.hash(
        filteredUpdates.password,
        salt
      );
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
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
};

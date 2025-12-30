const AuthService = require('../services/auth.service');
const Role = require('../models/role.model');
const User = require('../models/user.model');

const register = async (req, res) => {
  try {
    const { fullName, email, password, roleId, profilePhoto } = req.body;

    // Validate role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const result = await AuthService.register({
      fullName,
      email,
      password,
      role: roleId,
      profilePhoto,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await req.user.populate('role');
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user._id;

    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.role;
    delete updates.isActive;

    // If password is being updated, hash it first
    if (updates.password) {
      if (updates.password.length < 6) {
        return res
          .status(400)
          .json({ message: 'Password must be at least 6 characters' });
      }
      // Password will be hashed by user model pre-save hook
    }

    // If email is being updated, check for duplicates
    if (updates.email && updates.email !== req.user.email) {
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).populate('role');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data without password
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      isActive: user.isActive,
    };

    res.json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    // Since JWT is stateless, logout can be handled client-side

    res.json({
      message: 'Logged out successfully',
      // Clear tokens client-side
      clearTokens: true,
    });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
};

const getSystemRoles = async (req, res) => {
  try {
    const roles = await AuthService.getSystemRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: 'New password must be at least 6 characters' });
    }

    // Get user with password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getSystemRoles,
};

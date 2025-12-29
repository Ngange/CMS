const User = require('../models/user.model');

// Get current user's profile
const getMyProfile = async (req, res) => {
  try {
    // User is already attached to req by authenticateToken middleware
    const user = await User.findById(req.user._id)
      .populate('role', 'name description permissions')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update current user's profile
const updateMyProfile = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user._id;

    // Remove fields that users shouldn't be able to update themselves
    delete updates._id;
    delete updates.role;
    delete updates.isActive;

    // If password is being updated, validate length
    if (updates.password) {
      if (updates.password.length < 6) {
        return res.status(400).json({
          message: 'Password must be at least 6 characters',
        });
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
    })
      .populate('role', 'name description permissions')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Change password (separate from profile update for security)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(userId);

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changePassword,
};

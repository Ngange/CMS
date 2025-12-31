const User = require('../Models/user.model');
const Role = require('../Models/role.model');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');

class AuthService {
  static async register(userData) {
    // Check if email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id });
    const refreshToken = generateRefreshToken({ userId: user._id });

    return {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(email, password) {
    const user = await User.findOne({ email }).populate('role');

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    const accessToken = generateAccessToken({ userId: user._id });
    const refreshToken = generateRefreshToken({ userId: user._id });

    return {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
      accessToken,
      refreshToken,
    };
  }

  static async getSystemRoles() {
    const roles = await Role.find({ isSystemRole: true });
    return roles;
  }
}

module.exports = AuthService;

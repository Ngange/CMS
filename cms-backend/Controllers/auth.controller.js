const User = require('../models/user.model');
const Role = require('../models/role.model');

// REGISTER a new user
exports.register = async (req, res) => {
  try {
    const { fullname, email, password, roleName } = req.body;

    // Validate required fields
    if (!fullname || !email || !password || !roleName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: fullname, email, password, roleName',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { fullname }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or fullname already exists',
      });
    }

    // Find role by name
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified',
      });
    }

    // Create new user
    const newUser = new User({
      fullname,
      email,
      password,
      role: role._id,
      isActive: true,
    });

    await newUser.save();

    // Generate tokens
    const accessToken = newUser.generateAccessToken();
    const refreshToken = newUser.generateRefreshToken();

    // Save refresh token
    newUser.refreshToken = refreshToken;
    await newUser.save();

    // Prepare response
    const userResponse = await User.findById(newUser._id)
      .select('-password -refreshToken')
      .populate('role');

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken,
          accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// LOGIN user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user with password selected
    const user = await User.findOne({ email })
      .select('+password +refreshToken')
      .populate('role');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
      });
    }

    // Verify password
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Prepare response without sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken,
          accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

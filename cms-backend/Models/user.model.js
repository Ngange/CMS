const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true, // Enforce required
      unique: true, // Enforce uniqueness
      trim: true, // Automatically trim whitespace
      minlength: 4, // Minimum length of 4 characters
      max_length: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Store emails as lowercase
      match: /.+\@.+\..+/, // Regex for email format
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      match:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // At least one uppercase, one lowercase, one digit, one special character
      select: false, // Don't include password in queries by default
    },

    // Role reference
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role', // Reference to Role model
      required: true,
      index: true,
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now, // Set default value to current date/time
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  const user = this;

  // Only hash if password was changed
  if (!user.isModified('password')) return next();

  try {
    // Simple password hashing
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(process.env.BCRYPT_SALT_ROUNDS || 10);
    user.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp before saving
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Check if password is correct
userSchema.methods.checkPassword = async function (password) {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, this.password);
};

// Method to generate JWT token (LOGIN)
userSchema.methods.generateAccessToken = function () {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h' }
  );
};

// Method to generate refresh token (LOGIN)
userSchema.methods.generateRefreshToken = function () {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '1d',
  });
};

// Method to get user data without sensitive info
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

// Create the model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;

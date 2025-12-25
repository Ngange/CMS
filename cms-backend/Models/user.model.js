const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema({
  fullname: {
    type: String,
    required: true, // Enforce required
    unique: true, // Enforce uniqueness
    trim: true, // Automatically trim whitespace
    minlength: 4, // Minimum length of 4 characters
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Store emails as lowercase
    match: /.+\@.+\..+/, // Regex for email format
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    match:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // At least one uppercase, one lowercase, one digit, one special character
  },

  // Role reference
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role', // Reference to Role model
    required: true,
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true,
  },

  refreshToken: String,

  createdAt: {
    type: Date,
    default: Date.now, // Set default value to current date/time
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  const user = this;

  // Only hash if password was changed
  if (!user.isModified('password')) return next();

  try {
    // Simple password hashing
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Check if password is correct
userSchema.methods.checkPassword = async function (password) {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, this.password);
};

// Generate JWT token
userSchema.methods.generateToken = function () {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET || 'simple-secret',
    { expiresIn: '1h' }
  );
};

// Create the model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Role schema
const roleSchema = new Schema({
  // Role name
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  // What this role can do
  permissions: {
    type: [String],
    default: [],
  },

  // When it was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Don't delete role if users are using it
roleSchema.pre('remove', async function (next) {
  const User = mongoose.model('User');
  const usersWithThisRole = await User.find({ role: this._id });

  if (usersWithThisRole.length > 0) {
    next(new Error('Cannot delete role - users are still using it'));
  } else {
    next();
  }
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;

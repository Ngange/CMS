const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    permissions: [
      {
        resource: {
          type: String,
          required: true,
        },
        actions: [
          {
            type: String,
            enum: ['create', 'read', 'update', 'delete', 'publish'],
          },
        ],
      },
    ],
    isSystemRole: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Role', roleSchema);

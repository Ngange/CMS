const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Simple article schema
const articleSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  body: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    default: '',
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  published: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp before saving
articleSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Show author name when getting articles
articleSchema.pre('find', function (next) {
  this.populate('author', 'fullname');
  next();
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;

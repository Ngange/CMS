require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('../models/article.model');
const User = require('../models/user.model');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_db';

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const articleResult = await Article.updateMany(
      { image: { $regex: '^uploads/' } },
      { $set: { image: null } }
    );

    const userResult = await User.updateMany(
      { profilePhoto: { $regex: '^uploads/' } },
      { $set: { profilePhoto: null } }
    );

    console.log('Cleanup complete:');
    console.log(` - Articles updated: ${articleResult.modifiedCount}`);
    console.log(` - Users updated: ${userResult.modifiedCount}`);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
})();

const mongoose = require('mongoose');
const Article = require('../models/article.model');
const User = require('../models/user.model');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_db';

const testImages = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB\n');

    // Get first article with full details
    const article = await Article.findOne({
      image: { $exists: true, $ne: null },
    })
      .populate('author', 'fullName email')
      .lean();

    if (article) {
      console.log('Article:', article.title);
      console.log('Image URL:', article.image);
      console.log('Image length:', article.image.length);
      console.log('\nFirst 100 chars:', article.image.substring(0, 100));
      console.log('Starts with https?', article.image.startsWith('https'));
    } else {
      console.log('❌ No article with image found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

testImages();

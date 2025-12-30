// update-article-images.js
require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('../models/article.model');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_db';

const updateArticleImages = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB\n');

    // Map of article titles to their proper image URLs
    const imageMap = {
      'The Future of Artificial Intelligence in Healthcare':
        'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop',
      'Sustainable Energy Solutions for Modern Cities':
        'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=400&fit=crop',
      'The Impact of Remote Work on Corporate Culture':
        'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&h=400&fit=crop',
      'Advancements in Space Exploration Technologies':
        'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=400&fit=crop',
      'Climate Change: Challenges and Opportunities':
        'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=400&fit=crop',
      'The Evolution of Digital Payment Systems':
        'https://images.unsplash.com/photo-1613243555978-636c48dc653c?w=800&h=400&fit=crop',
      'Biotechnology Breakthroughs in Modern Medicine':
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
      'The Role of Social Media in Modern Politics':
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop',
      'Urban Planning in the Age of Smart Cities':
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop',
      'The Future of Education Technology':
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
    };

    let updatedCount = 0;

    for (const [title, imageUrl] of Object.entries(imageMap)) {
      const result = await Article.updateMany({ title }, { image: imageUrl });

      if (result.modifiedCount > 0) {
        console.log(`✓ Updated: "${title}"`);
        updatedCount += result.modifiedCount;
      }
    }

    console.log(`\n✅ Total articles updated: ${updatedCount}`);

    // Display all articles with their images
    console.log('\n=== Articles with Updated Images ===');
    const articles = await Article.find()
      .select('title image status')
      .sort({ createdAt: -1 });
    articles.forEach((article) => {
      const hasImage = article.image ? '✓' : '✗';
      console.log(`${hasImage} ${article.title}`);
      if (article.image) {
        console.log(`  Image: ${article.image.substring(0, 60)}...`);
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

updateArticleImages();

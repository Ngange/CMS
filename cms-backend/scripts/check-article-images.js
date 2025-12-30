require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('../models/article.model');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_db';

const checkArticleImages = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB\n');
    console.log('=== Checking Article Images ===\n');

    const articles = await Article.find()
      .select('title image status')
      .sort({ createdAt: -1 });

    articles.forEach((article, index) => {
      const hasImage = article.image ? '✓' : '✗';
      const status = article.status === 'published' ? '📰' : '📝';
      console.log(`${index + 1}. ${hasImage} ${status} ${article.title}`);
      if (article.image) {
        console.log(`   Image URL: ${article.image.substring(0, 80)}...`);
      }
    });

    const totalArticles = articles.length;
    const articlesWithImages = articles.filter((a) => a.image).length;

    console.log(`\n✅ Total articles: ${totalArticles}`);
    console.log(`✅ Articles with images: ${articlesWithImages}`);
    console.log(
      `❌ Articles without images: ${totalArticles - articlesWithImages}`
    );
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

checkArticleImages();

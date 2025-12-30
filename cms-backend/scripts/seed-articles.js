require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('../models/article.model');
const User = require('../models/user.model');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_db';

const seedArticles = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const author = await User.findOne({});
    if (!author) {
      console.error(
        'No users found. Create a user first (e.g., admin) before seeding articles.'
      );
      return;
    }

    const samples = [
      {
        title: 'Getting Started with the CMS',
        body: 'This guide walks you through creating your first article, managing media, and publishing content. Learn how roles and permissions affect what you see.',
        status: 'published',
        publishedAt: new Date(),
      },
      {
        title: 'Editorial Workflow Tips',
        body: 'Define your draft, review, and publish stages. Use roles to keep content quality high and approvals traceable.',
        status: 'draft',
      },
      {
        title: 'Designing with Content Blocks',
        body: 'Compose engaging layouts with images, quotes, and code snippets. Keep accessibility and responsiveness in mind.',
        status: 'published',
        publishedAt: new Date(),
      },
    ];

    for (const sample of samples) {
      const exists = await Article.findOne({ title: sample.title });
      if (exists) {
        console.log(`Skip existing: ${sample.title}`);
        continue;
      }
      await Article.create({
        ...sample,
        author: author._id,
        views: Math.floor(Math.random() * 150) + 10,
      });
      console.log(`Inserted: ${sample.title}`);
    }

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedArticles();

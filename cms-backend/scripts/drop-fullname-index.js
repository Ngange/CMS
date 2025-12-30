require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_db';

(async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const result = await mongoose.connection.db
      .collection('users')
      .dropIndex('fullname_1');
    console.log('Index drop result:', result);
  } catch (err) {
    console.error('Failed to drop index:', err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();

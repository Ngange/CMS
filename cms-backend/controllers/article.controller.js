const Article = require('../models/article.model');

const createArticle = async (req, res) => {
  try {
    const { title, body, image } = req.body;
    const article = new Article({
      title,
      body,
      author: req.user._id,
      image: image || null, // expect Cloudinary URL from client
    });
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getArticles = async (req, res) => {
  try {
    let query = {};

    // If user is Viewer, only show published articles
    if (req.user.role.name === 'Viewer') {
      query.status = 'published';
    }

    const articles = await Article.find(query)
      .populate('author', 'fullName email')
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate(
      'author',
      'fullName email'
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // If user is Viewer and article is not published, deny access
    if (req.user.role.name === 'Viewer' && article.status !== 'published') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateArticle = async (req, res) => {
  try {
    const { title, body, image, status } = req.body;
    const updateData = { title, body };

    // Always include image (Cloudinary URL, or null to clear)
    updateData.image = image || null;

    // Include status if provided
    if (status) {
      updateData.status = status;
    }

    const article = await Article.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const publishArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        status: 'published',
        publishedAt: new Date(),
      },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unpublishArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        status: 'draft',
        publishedAt: null,
      },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  unpublishArticle,
};

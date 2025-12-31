const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/authorization.middleware');
const {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  unpublishArticle,
} = require('../controllers/article.controller');

router.get('/', authenticateToken, getArticles);
router.get('/:id', authenticateToken, getArticle);
router.post(
  '/',
  authenticateToken,
  checkPermission('article', 'create'),
  upload.single('image'),
  createArticle
);
router.put(
  '/:id',
  authenticateToken,
  checkPermission('article', 'update'),
  upload.single('image'),
  updateArticle
);
router.delete(
  '/:id',
  authenticateToken,
  checkPermission('article', 'delete'),
  deleteArticle
);
router.post(
  '/:id/publish',
  authenticateToken,
  checkPermission('article', 'publish'),
  publishArticle
);
router.post(
  '/:id/unpublish',
  authenticateToken,
  checkPermission('article', 'publish'),
  unpublishArticle
);

module.exports = router;

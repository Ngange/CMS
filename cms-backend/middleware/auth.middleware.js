const { verifyAccessToken } = require('../config/jwt');
const User = require('../Models/user.model');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).populate('role');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };

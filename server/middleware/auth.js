const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'madrassa_sadeeq_akbar_secret_key_2026';

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      let user = await User.findById(decoded.id).select('-password');
      if (!user && decoded.role === 'master_admin') {
        user = await User.findOne({ role: 'master_admin' });
      }

      if (!user) {
        return res.status(401).json({ message: 'صارف نہیں ملا (User not found)' });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'ٹوکن غیر درست ہے، دوبارہ لاگ ان کریں (Not authorized, token failed)' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'برائے مہربانی پہلے لاگ ان کریں (Not authorized, no token)' });
  }
};

// Role-based access
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'اس عمل کی اجازت نہیں ہے (Not authorized for this action)' });
    }
    next();
  };
};

module.exports = { protect, authorize };

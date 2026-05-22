const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');
const { logSecurityEvent } = require('../utils/securityLogger');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      if (!req.user.isActive) {
        await logSecurityEvent({
          eventType: 'unauthorized_access',
          severity: 'high',
          user: { userId: req.user._id, email: req.user.email, name: req.user.name },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          endpoint: req.originalUrl,
          method: req.method,
          details: { reason: 'Account deactivated' }
        });
        return res.status(401).json({ success: false, message: 'Account is deactivated' });
      }

      next();
    } catch (error) {
      await logSecurityEvent({
        eventType: 'unauthorized_access',
        severity: 'medium',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        endpoint: req.originalUrl,
        method: req.method,
        details: { reason: 'Invalid token', error: error.message }
      });
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    logSecurityEvent({
      eventType: 'unauthorized_access',
      severity: 'high',
      user: { userId: req.user._id, email: req.user.email, name: req.user.name },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      endpoint: req.originalUrl,
      method: req.method,
      details: { reason: 'Admin access denied', userRole: req.user.role }
    });
    res.status(403).json({ success: false, message: 'Not authorized as admin' });
  }
};

const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as superadmin' });
  }
};

module.exports = { protect, adminOnly, superAdminOnly };

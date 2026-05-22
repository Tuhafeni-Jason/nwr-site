const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/security');
const { logSecurityEvent, calculateThreatScore } = require('../utils/securityLogger');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    await logSecurityEvent({
      eventType: 'login_success',
      severity: 'low',
      user: { userId: user._id, email: user.email, name: user.name },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      endpoint: '/api/auth/register',
      method: 'POST',
      details: { action: 'User registration' }
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      await logSecurityEvent({
        eventType: 'login_failure',
        severity: 'medium',
        ipAddress,
        userAgent: req.headers['user-agent'],
        endpoint: '/api/auth/login',
        method: 'POST',
        details: { email, reason: 'User not found' },
        threatScore: calculateThreatScore('login_failure')
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      await logSecurityEvent({
        eventType: 'login_failure',
        severity: 'high',
        user: { userId: user._id, email: user.email, name: user.name },
        ipAddress,
        userAgent: req.headers['user-agent'],
        endpoint: '/api/auth/login',
        method: 'POST',
        details: { reason: 'Account locked' },
        threatScore: 60
      });
      return res.status(423).json({ 
        success: false, 
        message: 'Account is temporarily locked. Please try again later.' 
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await logSecurityEvent({
          eventType: 'account_locked',
          severity: 'high',
          user: { userId: user._id, email: user.email, name: user.name },
          ipAddress,
          userAgent: req.headers['user-agent'],
          endpoint: '/api/auth/login',
          method: 'POST',
          details: { reason: 'Too many failed attempts', attempts: user.loginAttempts },
          threatScore: 75
        });
      }

      await user.save();

      await logSecurityEvent({
        eventType: 'login_failure',
        severity: 'medium',
        user: { userId: user._id, email: user.email, name: user.name },
        ipAddress,
        userAgent: req.headers['user-agent'],
        endpoint: '/api/auth/login',
        method: 'POST',
        details: { reason: 'Invalid password', attempts: user.loginAttempts },
        threatScore: calculateThreatScore('login_failure', { repeated: user.loginAttempts > 1 })
      });

      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Reset login attempts on success
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    await logSecurityEvent({
      eventType: 'login_success',
      severity: 'low',
      user: { userId: user._id, email: user.email, name: user.name },
      ipAddress,
      userAgent: req.headers['user-agent'],
      endpoint: '/api/auth/login',
      method: 'POST',
      details: { action: 'Successful login' }
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    await logSecurityEvent({
      eventType: 'password_change',
      severity: 'medium',
      user: { userId: user._id, email: user.email, name: user.name },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      endpoint: '/api/auth/password',
      method: 'PUT',
      details: { action: 'Password changed' }
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const SecurityLog = require('../models/SecurityLog');
const { protect, adminOnly } = require('../middleware/auth');
const { logSecurityEvent, calculateThreatScore } = require('../utils/securityLogger');

// @route   GET /api/security-logs
// @desc    Get all security logs
// @access  Admin only
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { severity, eventType, resolved, page = 1, limit = 20 } = req.query;

    let query = {};
    if (severity) query.severity = severity;
    if (eventType) query.eventType = eventType;
    if (resolved !== undefined) query.resolved = resolved === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await SecurityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SecurityLog.countDocuments(query);

    res.json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/security-logs/stats
// @desc    Get security statistics
// @access  Admin only
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalEvents = await SecurityLog.countDocuments();
    const criticalEvents = await SecurityLog.countDocuments({ severity: 'critical' });
    const highEvents = await SecurityLog.countDocuments({ severity: 'high' });
    const unresolvedEvents = await SecurityLog.countDocuments({ resolved: false });

    const eventsByType = await SecurityLog.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const eventsBySeverity = await SecurityLog.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    const dailyEvents = await SecurityLog.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          critical: {
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    const topThreatIPs = await SecurityLog.aggregate([
      { $match: { severity: { $in: ['high', 'critical'] } } },
      { $group: { _id: '$ipAddress', count: { $sum: 1 }, avgThreat: { $avg: '$threatScore' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalEvents,
        criticalEvents,
        highEvents,
        unresolvedEvents,
        threatLevel: criticalEvents > 10 ? 'critical' : highEvents > 20 ? 'high' : 'medium',
        eventsByType,
        eventsBySeverity,
        dailyEvents,
        topThreatIPs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/security-logs/:id/resolve
// @desc    Resolve a security event
// @access  Admin only
router.put('/:id/resolve', protect, adminOnly, async (req, res) => {
  try {
    const log = await SecurityLog.findByIdAndUpdate(
      req.params.id,
      { 
        resolved: true, 
        resolvedBy: req.user.id,
        resolvedAt: new Date()
      },
      { new: true }
    );

    if (!log) {
      return res.status(404).json({ success: false, message: 'Security log not found' });
    }

    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/security-logs/threats
// @desc    Get active threats
// @access  Admin only
router.get('/threats/active', protect, adminOnly, async (req, res) => {
  try {
    const threats = await SecurityLog.find({
      severity: { $in: ['high', 'critical'] },
      resolved: false
    })
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({ success: true, count: threats.length, data: threats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// HONEYPOT ENDPOINT - Fake admin secret route
// @route   GET /api/admin-secret
// @desc    Honeypot endpoint to catch attackers
// @access  Public (but logs everything)
router.get('/honeypot', async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;

  await logSecurityEvent({
    eventType: 'honeypot_triggered',
    severity: 'critical',
    ipAddress,
    userAgent: req.headers['user-agent'],
    endpoint: '/api/admin-secret',
    method: 'GET',
    details: { 
      message: 'Honeypot endpoint accessed - potential attacker detected',
      headers: req.headers,
      query: req.query
    },
    threatScore: calculateThreatScore('honeypot_triggered')
  });

  // Return fake data to keep attacker engaged
  res.status(200).json({
    status: 'access_denied',
    message: 'Admin panel requires additional verification',
    verification_required: true,
    redirect: '/api/admin-verify'
  });
});

module.exports = router;

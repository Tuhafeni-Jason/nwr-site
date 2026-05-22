const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: [
      'login_attempt',
      'login_success',
      'login_failure',
      'logout',
      'unauthorized_access',
      'honeypot_triggered',
      'brute_force_detected',
      'suspicious_activity',
      'data_export',
      'role_change',
      'password_change',
      'account_locked',
      'sql_injection_attempt',
      'xss_attempt',
      'api_abuse'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  user: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    name: String
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  location: {
    country: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  endpoint: {
    type: String
  },
  method: {
    type: String
  },
  statusCode: {
    type: Number
  },
  threatScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
securityLogSchema.index({ createdAt: -1 });
securityLogSchema.index({ eventType: 1, severity: 1 });
securityLogSchema.index({ ipAddress: 1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);

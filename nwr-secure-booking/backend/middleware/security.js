const rateLimit = require('express-rate-limit');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const { logSecurityEvent } = require('../utils/securityLogger');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res, next, options) => {
    await logSecurityEvent({
      eventType: 'api_abuse',
      severity: 'medium',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      endpoint: req.originalUrl,
      method: req.method,
      details: { reason: 'Rate limit exceeded' }
    });
    res.status(options.statusCode).json(options.message);
  }
});

// Strict rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: async (req, res, next, options) => {
    await logSecurityEvent({
      eventType: 'brute_force_detected',
      severity: 'high',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      endpoint: req.originalUrl,
      method: req.method,
      details: { reason: 'Login rate limit exceeded', email: req.body.email }
    });
    res.status(options.statusCode).json(options.message);
  }
});

// Security headers middleware
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  const suspiciousPatterns = [
    /<script[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /SELECT\s+.*\s+FROM/gi,
    /INSERT\s+INTO/gi,
    /DELETE\s+FROM/gi,
    /DROP\s+TABLE/gi,
    /UNION\s+SELECT/gi,
    /';\s*--/g,
    /";\s*--/g
  ];

  const checkValue = async (value, key) => {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(value)) {
        await logSecurityEvent({
          eventType: pattern.toString().includes('script') || pattern.toString().includes('javascript') 
            ? 'xss_attempt' : 'sql_injection_attempt',
          severity: 'critical',
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          endpoint: req.originalUrl,
          method: req.method,
          details: { 
            field: key,
            value: value.substring(0, 100),
            pattern: pattern.toString()
          }
        });
        return true;
      }
    }
    return false;
  };

  const sanitize = async (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        if (await checkValue(obj[key], key)) {
          return false;
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (!await sanitize(obj[key])) {
          return false;
        }
      }
    }
    return true;
  };

  sanitize({ ...req.body, ...req.query, ...req.params }).then(isClean => {
    if (!isClean) {
      return res.status(400).json({ 
        success: false, 
        message: 'Suspicious input detected. Security team has been notified.' 
      });
    }
    next();
  });
};

// Request logging middleware
const requestLogger = async (req, res, next) => {
  const geo = geoip.lookup(req.ip || req.connection.remoteAddress);
  const ua = UAParser(req.headers['user-agent']);

  req.securityContext = {
    ip: req.ip || req.connection.remoteAddress,
    geo: geo ? {
      country: geo.country,
      city: geo.city,
      ll: geo.ll
    } : null,
    ua: {
      browser: ua.browser.name,
      os: ua.os.name,
      device: ua.device.type || 'desktop'
    }
  };

  next();
};

module.exports = {
  apiLimiter,
  loginLimiter,
  securityHeaders,
  sanitizeInput,
  requestLogger
};

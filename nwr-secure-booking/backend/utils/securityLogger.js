const SecurityLog = require('../models/SecurityLog');
const geoip = require('geoip-lite');

const logSecurityEvent = async ({
  eventType,
  severity = 'low',
  user = null,
  ipAddress,
  userAgent = '',
  location = null,
  details = {},
  endpoint = '',
  method = '',
  statusCode = null,
  threatScore = 0
}) => {
  try {
    // Get location from IP if not provided
    let eventLocation = location;
    if (!eventLocation && ipAddress && ipAddress !== '127.0.0.1') {
      const geo = geoip.lookup(ipAddress);
      if (geo) {
        eventLocation = {
          country: geo.country,
          city: geo.city,
          latitude: geo.ll ? geo.ll[0] : null,
          longitude: geo.ll ? geo.ll[1] : null
        };
      }
    }

    const log = await SecurityLog.create({
      eventType,
      severity,
      user,
      ipAddress,
      userAgent,
      location: eventLocation,
      details,
      endpoint,
      method,
      statusCode,
      threatScore
    });

    console.log(`[SECURITY] ${severity.toUpperCase()}: ${eventType} - ${ipAddress}`);
    return log;
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

const calculateThreatScore = (eventType, details = {}) => {
  let score = 0;

  switch (eventType) {
    case 'honeypot_triggered':
      score = 85;
      break;
    case 'brute_force_detected':
      score = 80;
      break;
    case 'sql_injection_attempt':
    case 'xss_attempt':
      score = 95;
      break;
    case 'unauthorized_access':
      score = 60;
      break;
    case 'suspicious_activity':
      score = 50;
      break;
    case 'login_failure':
      score = 20;
      break;
    case 'api_abuse':
      score = 40;
      break;
    default:
      score = 10;
  }

  // Adjust based on details
  if (details.repeated) score += 15;
  if (details.automated) score += 20;

  return Math.min(score, 100);
};

module.exports = { logSecurityEvent, calculateThreatScore };

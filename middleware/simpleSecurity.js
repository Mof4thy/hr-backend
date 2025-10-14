/**
 * Simple & Effective Security Middleware
 * Just the essentials - no overcomplification!
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// 1. Basic Rate Limiting (Prevent Brute Force)
const basicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 minutes - much more generous
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: process.env.NODE_ENV === 'development' ? 50 : 10, // More generous in development
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Basic Security Headers
const securityHeaders = helmet({
  contentSecurityPolicy: false, // Keep it simple for API
  crossOriginEmbedderPolicy: false
});

// 3. Simple SQL Injection Protection
const basicSQLProtection = (req, res, next) => {
  const checkValue = (value) => {
    if (typeof value === 'string') {
      // Just block obvious SQL injection attempts
      const dangerous = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'CREATE', 'ALTER', '--', ';', 'UNION', 'SELECT'];
      const upperValue = value.toUpperCase();
      
      for (const keyword of dangerous) {
        if (upperValue.includes(keyword)) {
          return false;
        }
      }
    }
    return true;
  };

  // Check all inputs recursively
  const checkObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.every(checkObject);
    } else if (obj && typeof obj === 'object') {
      return Object.values(obj).every(checkObject);
    } else {
      return checkValue(obj);
    }
  };

  // Check request data
  if (!checkObject(req.body) || !checkObject(req.query) || !checkObject(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  next();
};

module.exports = {
  basicLimiter,
  authLimiter,
  securityHeaders,
  basicSQLProtection
};

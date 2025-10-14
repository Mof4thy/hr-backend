/**
 * Simple Authentication Middleware
 * Basic JWT authentication for HR users
 */

const jwt = require('jsonwebtoken');
const { HRUser } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Authentication middleware - supports both HTTP-Only cookies and Authorization header
 */
const authenticateHR = async (req, res, next) => {
  try {
    // Try to get token from HTTP-Only cookie first, then from Authorization header
    let token = req.cookies?.authToken || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await HRUser.findByPk(decoded.userId, {
      attributes: ['userId', 'username', 'email', 'fullName', 'role', 'isActive']
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token or user not found' 
      });
    }

    req.user = user;
    next();
    
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

/**
 * Admin only middleware
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 'Admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }

  next();
};

/**
 * HR and Admin middleware - allows both HR and Admin roles
 */
const hrOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 'Admin' && req.user.role !== 'HR') {
    return res.status(403).json({ 
      success: false, 
      message: 'HR or Admin access required' 
    });
  }

  next();
};

module.exports = { authenticateHR, adminOnly, hrOrAdmin, JWT_SECRET };

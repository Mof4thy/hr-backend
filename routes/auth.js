/**
 * Simple Authentication Routes
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateHR, adminOnly } = require('../middleware/auth');
const { authLimiter } = require('../middleware/simpleSecurity');

// Login route (simple security - just rate limiting)
router.post('/login', authLimiter, AuthController.login);

// Logout route
router.post('/logout', AuthController.logout);

// Get profile route (protected)
router.get('/profile', authenticateHR, AuthController.getProfile);

// Change password (protected)
router.put('/change-password', authenticateHR, AuthController.changePassword);

// Admin routes for HR user management
router.post('/hr-users', authenticateHR, adminOnly, AuthController.createHRUser);
router.get('/hr-users', authenticateHR, adminOnly, AuthController.getAllHRUsers);
router.put('/hr-users/:id', authenticateHR, adminOnly, AuthController.updateHRUser);
router.delete('/hr-users/:id', authenticateHR, adminOnly, AuthController.deleteHRUser);

// Get available roles and permissions (Admin only)
router.get('/roles', authenticateHR, adminOnly, AuthController.getRolesAndPermissions);

module.exports = router;

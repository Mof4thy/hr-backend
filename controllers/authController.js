/**
 * Simple Authentication Controller
 * Basic login/logout for HR users
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { HRUser } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

class AuthController {
  /**
   * Get user permissions based on role
   */
  static getUserPermissions(role) {
    const permissions = {
      'Admin': [
        'view_all_applications',
        'manage_applications',
        'manage_users',
        'reports_analytics',
        'system_settings',
        'delete_users',
        'create_users',
        'update_users'
      ],
      'HR': [
        'view_all_applications',
        'manage_applications',
        'reports_analytics',
        'view_users'
      ]
    };
    
    return permissions[role] || [];
  }
  /**
   * HR User Login
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Find user
      const user = await HRUser.findOne({ 
        where: { username }
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.userId, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '12h' }
      );

      // Set HTTP-Only cookie
      res.cookie('authToken', token, {
        httpsOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
        sameSite: 'lax', // CSRF protection
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        path: '/'
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            userId: user.userId,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      res.json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  /**
   * Change password
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      // Get user with password
      const user = await HRUser.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      await user.update({ passwordHash: hashedNewPassword });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }

  /**
   * Create HR user (Admin only)
   */
  static async createHRUser(req, res) {
    try {
      const { username, email, fullName, password, role = 'HR' } = req.body;

      // Validate role
      const validRoles = ['HR', 'Admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be either "HR" or "Admin"'
        });
      }

      // Check if user already exists
      const existingUser = await HRUser.findOne({
        where: {
          [require('sequelize').Op.or]: [
            { username },
            { email }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Determine user type based on role
      const userType = role === 'Admin' ? 'admin' : 'hr';

      // Create user
      const newUser = await HRUser.create({
        username,
        email,
        fullName,
        passwordHash: hashedPassword,
        role,
        isActive: true
      });

      res.status(201).json({
        success: true,
        message: `${role} user created successfully`,
        data: {
          user: {
            userId: newUser.userId,
            username: newUser.username,
            email: newUser.email,
            fullName: newUser.fullName,
            role: newUser.role,
            userType: userType,
            isActive: newUser.isActive,
            permissions: AuthController.getUserPermissions(role)
          }
        }
      });

    } catch (error) {
      console.error('Create HR user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create HR user'
      });
    }
  }

  /**
   * Get all HR users (Admin only)
   */
  static async getAllHRUsers(req, res) {
    try {
      const users = await HRUser.findAll({
        attributes: ['userId', 'username', 'email', 'fullName', 'role', 'isActive', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });

      // Add user type and permissions to each user
      const usersWithTypes = users.map(user => ({
        ...user.toJSON(),
        userType: user.role === 'Admin' ? 'admin' : 'hr',
        permissions: AuthController.getUserPermissions(user.role)
      }));

      res.json({
        success: true,
        data: {
          users: usersWithTypes
        }
      });

    } catch (error) {
      console.error('Get HR users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get HR users'
      });
    }
  }

  /**
   * Update HR user (Admin only)
   * 
   */
  static async updateHRUser(req, res) {
    try {
      const { id } = req.params;
      const { email, fullName, role, isActive } = req.body;

      const user = await HRUser.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'HR user not found'
        });
      }

      // Validate role if provided
      if (role) {
        const validRoles = ['HR', 'Admin'];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid role. Must be either "HR" or "Admin"'
          });
        }
      }

      await user.update({
        email: email || user.email,
        fullName: fullName || user.fullName,
        role: role || user.role,
        isActive: isActive !== undefined ? isActive : user.isActive
      });

      // Determine user type based on updated role
      const userType = user.role === 'Admin' ? 'admin' : 'hr';

      res.json({
        success: true,
        message: 'HR user updated successfully',
        data: {
          user: {
            userId: user.userId,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            userType: userType,
            isActive: user.isActive,
            permissions: AuthController.getUserPermissions(user.role)
          }
        }
      });

    } catch (error) {
      console.error('Update HR user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update HR user'
      });
    }
  }

  /**
   * Delete HR user (Admin only)
   */
  static async deleteHRUser(req, res) {
    try {
      const userId = parseInt(req.params.id);

      // Check if user exists
      const userToDelete = await HRUser.findByPk(userId);
      if (!userToDelete) {
        return res.status(404).json({
          success: false,
          message: 'HR user not found'
        });
      }

      // Prevent admin from deleting themselves
      if (userId === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }

      // Prevent deleting the last admin user
      if (userToDelete.role === 'Admin') {
        const adminCount = await HRUser.count({
          where: { role: 'Admin', isActive: true }
        });
        
        if (adminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete the last admin user'
          });
        }
      }

      // Delete the user
      await userToDelete.destroy();

      res.status(200).json({
        success: true,
        message: 'HR user deleted successfully',
        data: {
          deletedUser: {
            userId: userToDelete.userId,
            username: userToDelete.username,
            email: userToDelete.email,
            fullName: userToDelete.fullName,
            role: userToDelete.role
          }
        }
      });

    } catch (error) {
      console.error('Delete HR user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete HR user'
      });
    }
  }

  /**
   * Get available roles and their permissions (Admin only)
   */
  static async getRolesAndPermissions(req, res) {
    try {
      const roles = {
        'HR': {
          userType: 'hr',
          permissions: AuthController.getUserPermissions('HR'),
          description: 'HR Manager - Can view and manage applications, generate reports'
        },
        'Admin': {
          userType: 'admin',
          permissions: AuthController.getUserPermissions('Admin'),
          description: 'System Administrator - Full access to all features including user management'
        }
      };

      res.json({
        success: true,
        data: {
          roles
        }
      });

    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get roles and permissions'
      });
    }
  }

  /**
   * Logout user (clear HTTP-Only cookie)
   */
  static async logout(req, res) {
    try {
      // Clear the HTTP-Only cookie
      res.clearCookie('authToken', {
        httpsOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }
}

module.exports = AuthController;

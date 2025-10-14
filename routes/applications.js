/**
 * Application Routes
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ApplicationController = require('../controllers/applicationController');
const { authenticateHR } = require('../middleware/auth');
// No complex validation needed - Sequelize protects us!

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'cv') {
      cb(null, 'uploads/cv/');
    } else if (file.fieldname === 'profileImage') {
      cb(null, 'uploads/images/');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'cv') {
      // Allow PDF and DOC files for CV
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('CV must be PDF or DOC file'), false);
    }
  } else if (file.fieldname === 'profileImage') {
    // Allow image files for profile image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Profile image must be an image file'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB general limit (will be overridden by custom middleware)
  }
});

// Custom middleware to check file sizes based on field
const checkFileSizes = (req, res, next) => {
  if (req.files) {
    // Check CV file size (2MB limit)
    if (req.files.cv && req.files.cv[0]) {
      const cvFile = req.files.cv[0];
      if (cvFile.size > 2 * 1024 * 1024) {
        return res.status(413).json({
          success: false,
          message: 'CV file size must be less than 2MB',
          error: 'FILE_TOO_LARGE'
        });
      }
    }
    
    // Check profile image file size (5MB limit)
    if (req.files.profileImage && req.files.profileImage[0]) {
      const imageFile = req.files.profileImage[0];
      if (imageFile.size > 5 * 1024 * 1024) {
        return res.status(413).json({
          success: false,
          message: 'Profile image size must be less than 5MB',
          error: 'FILE_TOO_LARGE'
        });
      }
    }
  }
  next();
};

// Public routes (for applicants)
router.post('/submit', ApplicationController.submitApplication);

// Protected routes (for HR users) 
router.get('/', authenticateHR, ApplicationController.getAllApplications);
router.get('/stats', authenticateHR, ApplicationController.getApplicationStats);
router.get('/export/excel', authenticateHR, ApplicationController.exportApplicationsToExcel);
router.get('/:id', authenticateHR, ApplicationController.getApplicationById);
router.put('/:id/status', authenticateHR, ApplicationController.updateApplicationStatus);

module.exports = router;

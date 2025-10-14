/**
 * Upload Routes - Separate file upload endpoints
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for CV uploads
const cvStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/cv/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cv-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const cvFileFilter = (req, file, cb) => {
  // Allow PDF and DOC files for CV
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('CV must be PDF or DOC file'), false);
  }
};

const cvUpload = multer({ 
  storage: cvStorage,
  fileFilter: cvFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for CV
  }
});

// CV Upload endpoint
router.post('/cv', cvUpload.single('cv'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CV file uploaded'
      });
    }

    // Return the file path for use in application submission
    res.json({
      success: true,
      message: 'CV uploaded successfully',
      data: {
        fileName: req.file.filename,
        filePath: req.file.path,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('CV upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload CV',
      error: error.message
    });
  }
});

// Profile image upload endpoint (for future use)
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Profile image must be an image file'), false);
  }
};

const imageUpload = multer({ 
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  }
});

router.post('/profile-image', imageUpload.single('profileImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No profile image uploaded'
      });
    }

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        fileName: req.file.filename,
        filePath: req.file.path,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error.message
    });
  }
});

module.exports = router;

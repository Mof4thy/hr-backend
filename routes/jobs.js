const express = require('express')
const router = express.Router()
const JobTitleController = require('../controllers/jobTitleController')
const { authenticateHR } = require('../middleware/auth')

// Public
router.get('/jobs', JobTitleController.listActive)

// Authenticated HR users
router.get('/jobs/all', authenticateHR, JobTitleController.listAll)
router.post('/jobs', authenticateHR, JobTitleController.create)
router.put('/jobs/:id', authenticateHR, JobTitleController.update)
router.patch('/jobs/:id/status', authenticateHR, JobTitleController.setStatus)
router.delete('/jobs/:id', authenticateHR, JobTitleController.remove)

module.exports = router

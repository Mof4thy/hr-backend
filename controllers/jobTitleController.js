const { JobTitle } = require('../models')

const JobTitleController = {
  // Public: list active titles
  async listActive(req, res) {
    try {
      const titles = await JobTitle.findAll({
        where: { isActive: true },
        order: [['title', 'ASC']],
        attributes: ['jobTitleId', 'title']
      })
      res.json({ success: true, data: { titles } })
    } catch (error) {
      console.error('List active job titles error:', error)
      res.status(500).json({ success: false, message: 'Failed to load job titles' })
    }
  },

  // Admin: list all
  async listAll(req, res) {
    try {
      const titles = await JobTitle.findAll({ order: [['createdAt', 'DESC']] })
      res.json({ success: true, data: { titles } })
    } catch (error) {
      console.error('List all job titles error:', error)
      res.status(500).json({ success: false, message: 'Failed to load job titles' })
    }
  },

  // Admin: create
  async create(req, res) {
    try {
      const { title } = req.body
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Title is required' })
      }
      const exists = await JobTitle.findOne({ where: { title: title.trim() } })
      if (exists) {
        return res.status(409).json({ success: false, message: 'Title already exists' })
      }
      const jobTitle = await JobTitle.create({ title: title.trim(), isActive: true })
      res.status(201).json({ success: true, message: 'Job title created', data: { jobTitle } })
    } catch (error) {
      console.error('Create job title error:', error)
      res.status(500).json({ success: false, message: 'Failed to create job title' })
    }
  },

  // Admin: update title
  async update(req, res) {
    try {
      const { id } = req.params
      const { title } = req.body
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Title is required' })
      }
      const jobTitle = await JobTitle.findByPk(id)
      if (!jobTitle) {
        return res.status(404).json({ success: false, message: 'Job title not found' })
      }
      // ensure uniqueness
      const dup = await JobTitle.findOne({ where: { title: title.trim() } })
      if (dup && dup.jobTitleId !== jobTitle.jobTitleId) {
        return res.status(409).json({ success: false, message: 'Title already exists' })
      }
      await jobTitle.update({ title: title.trim() })
      res.json({ success: true, message: 'Job title updated', data: { jobTitle } })
    } catch (error) {
      console.error('Update job title error:', error)
      res.status(500).json({ success: false, message: 'Failed to update job title' })
    }
  },

  // Admin: set status
  async setStatus(req, res) {
    try {
      const { id } = req.params
      const { isActive } = req.body
      const jobTitle = await JobTitle.findByPk(id)
      if (!jobTitle) {
        return res.status(404).json({ success: false, message: 'Job title not found' })
      }
      await jobTitle.update({ isActive: Boolean(isActive) })
      res.json({ success: true, message: 'Status updated', data: { jobTitle } })
    } catch (error) {
      console.error('Update job title status error:', error)
      res.status(500).json({ success: false, message: 'Failed to update status' })
    }
  },

  // Admin: delete
  async remove(req, res) {
    try {
      const { id } = req.params
      const jobTitle = await JobTitle.findByPk(id)
      if (!jobTitle) {
        return res.status(404).json({ success: false, message: 'Job title not found' })
      }
      await jobTitle.destroy()
      res.json({ success: true, message: 'Job title deleted' })
    } catch (error) {
      console.error('Delete job title error:', error)
      res.status(500).json({ success: false, message: 'Failed to delete job title' })
    }
  }
}

module.exports = JobTitleController


/**
 * Application Controller
 * Handle application submissions and management
 */

const { 
  Application, 
  PersonalInfo, 
  Experience, 
  CurrentJob, 
  PredefinedSkills, 
  CustomSkill, 
  Languages, 
  AdditionalLanguage, 
  CompanyRelationships, 
  Education 
} = require('../models');
const { Op } = require('sequelize');
const XLSX = require('xlsx');

class ApplicationController {
  /**
   * Submit new application (Public endpoint)
   * 
   */
  static async submitApplication(req, res) {
    console.log('=== APPLICATION SUBMISSION START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const transaction = await Application.sequelize.transaction();
    
    try {
      // Handle different job title formats
      const jobTitle = req.body.jobTitle || req.body.appliedJob?.jobTitle;
      const educationStatus = req.body.educationStatus;
      console.log('Extracted jobTitle:', jobTitle);
      console.log('Extracted educationStatus:', educationStatus);
      
      // Basic validation
      if (!jobTitle) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Job title is required'
        });
      }

      // Get CV path from request body (uploaded separately)
      const cvPath = req.body.cvPath || null;

      // Create main application
      const application = await Application.create({
        jobTitle: jobTitle,
        educationStatus: educationStatus,
        cvPath: cvPath,
        status: 'pending'
      }, { transaction });

      // Create personal info
      if (req.body.personalInfo) {
        console.log('Creating PersonalInfo with:', req.body.personalInfo);
        
        // Convert hasVehicle string to boolean if needed
        const personalInfo = { ...req.body.personalInfo };
        if (typeof personalInfo.hasVehicle === 'string') {
          personalInfo.hasVehicle = personalInfo.hasVehicle === 'yes' || personalInfo.hasVehicle === 'true';
        }
        
        await PersonalInfo.create({
          applicationId: application.applicationId,
          ...personalInfo,
          profileImagePath: req.body.profileImagePath || null
        }, { transaction });
      }

      // Create experiences
      if (req.body.experiences && req.body.experiences.length > 0) {
        const experiences = req.body.experiences.map(exp => ({
          applicationId: application.applicationId,
          ...exp
        }));
        await Experience.bulkCreate(experiences, { transaction });
      }

      // Create current job
      if (req.body.currentJob) {
        await CurrentJob.create({
          applicationId: application.applicationId,
          ...req.body.currentJob
        }, { transaction });
      }

      // Create predefined skills (only if at least one skill is selected)
      if (req.body.skills?.predefined) {
        const predefined = req.body.skills.predefined;
        const hasAnySkill = predefined.word || predefined.excel || predefined.powerpoint;
        
        if (hasAnySkill) {
          // Convert empty strings to null for database
          const skillsData = {
            applicationId: application.applicationId,
            word: predefined.word || null,
            excel: predefined.excel || null,
            powerpoint: predefined.powerpoint || null
          };
          
          console.log('Creating PredefinedSkills with:', skillsData);
          await PredefinedSkills.create(skillsData, { transaction });
        } else {
          console.log('Skipping PredefinedSkills - all values are empty');
        }
      }

      // Create custom skills
      if (req.body.skills?.custom && req.body.skills.custom.length > 0) {
        const customSkills = req.body.skills.custom.map(skill => ({
          applicationId: application.applicationId,
          ...skill
        }));
        await CustomSkill.bulkCreate(customSkills, { transaction });
      }

      // Create languages (only if english level is selected)
      if (req.body.languages?.english && req.body.languages.english.trim() !== '') {
        console.log('Creating Languages with english:', req.body.languages.english);
        await Languages.create({
          applicationId: application.applicationId,
          english: req.body.languages.english
        }, { transaction });
      } else {
        console.log('Skipping Languages - english level is empty');
      }

      // Create additional languages
      if (req.body.languages?.additional && req.body.languages.additional.length > 0) {
        const additionalLanguages = req.body.languages.additional.map(lang => ({
          applicationId: application.applicationId,
          ...lang
        }));
        await AdditionalLanguage.bulkCreate(additionalLanguages, { transaction });
      }

      // Create company relationships
      if (req.body.companyRelationships) {
        await CompanyRelationships.create({
          applicationId: application.applicationId,
          ...req.body.companyRelationships
        }, { transaction });
      }

      // Create education
      if (req.body.education && req.body.education.length > 0) {
        const education = req.body.education.map(edu => ({
          applicationId: application.applicationId,
          ...edu
        }));
        await Education.bulkCreate(education, { transaction });
      }

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          applicationId: application.applicationId,
          status: application.status
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('=== APPLICATION SUBMISSION ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application'
      });
    }
  }

  /**
   * Get all applications (HR only)
   * params: page, limit, search, status, jobTitle
   * return: applications, pagination
   */
  static async getAllApplications(req, res) {
    try {
      const { page = 1, limit = 10, search = '', status = '', jobTitle = '' } = req.query;
      const offset = (page - 1) * limit;

      // Build where clause for Application table
      const whereClause = {};
      
      if (status) {
        whereClause.status = status;
      } else {
        // Default: exclude accepted_to_join from main list
        whereClause.status = { [Op.ne]: 'accepted_to_join' };
      }
      
      if (jobTitle) {
        whereClause.jobTitle = {
          [Op.like]: `%${jobTitle}%`
        };
      }

      // Build include for search in PersonalInfo
      const includeOptions = [
        {
          model: PersonalInfo,
          as: 'personalInfo',
          attributes: ['name', 'whatsappNumber', 'profileImagePath', 'age', 'governorate', 'area', 'gender'],
          required: false // LEFT JOIN to include applications even without personalInfo
        }
      ];

      // Add search condition for PersonalInfo if search term provided
      if (search) {
        includeOptions[0].where = {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { whatsappNumber: { [Op.like]: `%${search}%` } }
          ]
        };
        includeOptions[0].required = true; // INNER JOIN when searching
      }

      const { count, rows } = await Application.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        attributes: [
          'applicationId', 'jobTitle', 'educationStatus', 'status', 'createdAt', 'updatedAt', 'cvPath'
        ]
      });

      res.json({
        success: true,
        data: {
          applications: rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalCount: count,
            hasNextPage: page < Math.ceil(count / limit),
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get applications'
      });
    }
  }

  /**
   * Get single application details (HR only)
   * params: id
   * return: application
   */
  static async getApplicationById(req, res) {
    try {
      const { id } = req.params;

      const application = await Application.findByPk(id, {
        include: [
          {
            model: PersonalInfo,
            as: 'personalInfo'
          },
          {
            model: Experience,
            as: 'experiences'
          },
          {
            model: CurrentJob,
            as: 'currentJob'
          },
          {
            model: PredefinedSkills,
            as: 'predefinedSkills'
          },
          {
            model: CustomSkill,
            as: 'customSkills'
          },
          {
            model: Languages,
            as: 'languages'
          },
          {
            model: AdditionalLanguage,
            as: 'additionalLanguages'
          },
          {
            model: CompanyRelationships,
            as: 'companyRelationships'
          },
          {
            model: Education,
            as: 'education'
          }
        ]
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      res.json({
        success: true,
        data: {
          application
        }
      });

    } catch (error) {
      console.error('Get application error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get application'
      });
    }
  }

  /**
   * Update application status (HR only)
   * params: id, status
   * return: applicationId, status
   */
  static async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected', 'accepted_for_interview', 'accepted_to_join'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const application = await Application.findByPk(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      await application.update({ status });

      // Optional onboarding hook for accepted_to_join status
      if (status === 'accepted_to_join') {
        // TODO: Implement OnboardingService.startOnboarding(application)
        console.log(`Application ${application.applicationId} accepted to join - onboarding can be triggered here`);
      }

      res.json({
        success: true,
        message: 'Application status updated successfully',
        data: {
          applicationId: application.applicationId,
          status: application.status
        }
      });

    } catch (error) {
      console.error('Update application status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application status'
      });
    }
  }

  /**
   * Get application statistics (HR only)
   */
  static async getApplicationStats(req, res) {
    try {
      const stats = await Application.findAll({
        attributes: [
          'status',
          [Application.sequelize.fn('COUNT', Application.sequelize.col('applicationId')), 'count']
        ],
        group: ['status']
      });

      const totalApplications = await Application.count();

      const formattedStats = stats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.dataValues.count);
        return acc;
      }, {});

      res.json({
        success: true,
        data: {
          totalApplications,
          byStatus: formattedStats
        }
      });

    } catch (error) {
      console.error('Get application stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get application statistics'
      });
    }
  }

  /**
   * Get accepted to join applications (HR only)
   * params: page, limit, search, jobTitle
   * return: applications, pagination
   */
  static async getAcceptedToJoinApplications(req, res) {
    try {
      const { page = 1, limit = 10, search = '', jobTitle = '' } = req.query;
      const offset = (page - 1) * limit;

      // Build where clause for Application table - only accepted_to_join
      const whereClause = {
        status: 'accepted_to_join'
      };
      
      if (jobTitle) {
        whereClause.jobTitle = {
          [Op.like]: `%${jobTitle}%`
        };
      }

      // Build include for search in PersonalInfo
      const includeOptions = [
        {
          model: PersonalInfo,
          as: 'personalInfo',
          attributes: ['name', 'whatsappNumber', 'profileImagePath', 'age', 'governorate', 'area', 'gender'],
          required: false // LEFT JOIN to include applications even without personalInfo
        }
      ];

      // Add search condition for PersonalInfo if search term provided
      if (search) {
        includeOptions[0].where = {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { whatsappNumber: { [Op.like]: `%${search}%` } }
          ]
        };
        includeOptions[0].required = true; // INNER JOIN when searching
      }

      const { count, rows } = await Application.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        attributes: [
          'applicationId', 'jobTitle', 'educationStatus', 'status', 'createdAt', 'updatedAt', 'cvPath'
        ]
      });

      res.json({
        success: true,
        data: {
          applications: rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalCount: count,
            hasNextPage: page < Math.ceil(count / limit),
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get accepted to join applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get accepted to join applications'
      });
    }
  }

  /**
   * Export all applications to Excel (HR only)
   */
  static async exportApplicationsToExcel(req, res) {
    try {
      console.log('Starting Excel export...');

      // Fetch all applications with related data
      const applications = await Application.findAll({
        include: [
          {
            model: PersonalInfo,
            as: 'personalInfo'
          },
          {
            model: Experience,
            as: 'experiences'
          },
          {
            model: CurrentJob,
            as: 'currentJob'
          },
          {
            model: PredefinedSkills,
            as: 'predefinedSkills'
          },
          {
            model: CustomSkill,
            as: 'customSkills'
          },
          {
            model: Languages,
            as: 'languages'
          },
          {
            model: AdditionalLanguage,
            as: 'additionalLanguages'
          },
          {
            model: CompanyRelationships,
            as: 'companyRelationships'
          },
          {
            model: Education,
            as: 'education'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      console.log(`Found ${applications.length} applications to export`);

      // Check if there are any applications
      if (applications.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No applications found to export'
        });
      }

      // Transform data for Excel - comprehensive export with all personal info and experience
      const excelData = applications.map(app => {
        const personalInfo = app.personalInfo || {};
        const currentJob = app.currentJob || {};
        const experiences = app.experiences || [];

        // Format education status
        const educationStatusMap = {
          'higher-qualification': 'مؤهل عالي',
          'above-intermediate-qualification': 'مؤهل فوق متوسط',
          'preparatory': 'إعدادية',
          'primary': 'ابتدائية',
          'illiterate': 'محو أمية',
          'no-qualification': 'بدون مؤهل'
        };
        const educationStatusText = educationStatusMap[app.educationStatus] || app.educationStatus || 'Not specified';

        // Format work experience
        const experienceText = experiences.map(exp => 
          `${exp.company || 'N/A'} - ${exp.role || 'N/A'} (${exp.fromDate || 'N/A'} to ${exp.toDate || 'N/A'})`
        ).join('; ') || 'No experience listed';

        // Format current employment
        const currentEmploymentText = currentJob.isCurrentlyEmployed 
          ? `${currentJob.company || 'N/A'} - ${currentJob.role || 'N/A'} (Salary: ${currentJob.salary || 'N/A'})`
          : 'Not currently employed';

        return {
          // Basic Info
          'ID': app.applicationId || '',
          'Name': personalInfo.name || '',
          'Applied Position': app.jobTitle || '',
          'Application Status': app.status || '',
          'Applied Date': app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-GB') : '',
          
          // Personal Information
          'Date of Birth': personalInfo.dateOfBirth || '',
          'Age': personalInfo.age || '',
          'Government': personalInfo.governorate || '',
          'Area': personalInfo.area || '',
          'Gender': personalInfo.gender || '',
          'Address': personalInfo.address || '',
          'National ID': personalInfo.nationalId || '',
          'Nationality': personalInfo.nationality || '',
          'Mobile Number': personalInfo.mobileNumber || '',
          'WhatsApp Number': personalInfo.whatsappNumber || '',
          'Email': personalInfo.email || '',
          'Emergency Contact': personalInfo.emergencyNumber || '',
          'Military Service Status': personalInfo.militaryServiceStatus || '',
          'Social Status': personalInfo.socialStatus || '',
          'Has Vehicle': personalInfo.hasVehicle ? 'Yes' : 'No',
          'Driving License': personalInfo.drivingLicense || '',
          'Education Status': educationStatusText,
          
          // Employment Information
          'Current Employment': currentEmploymentText,
          'Work Experience': experienceText,
          
          // Additional Information
          'Comments': app.comments || ''
        };
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
      const columnWidths = [];
      const headers = Object.keys(excelData[0] || {});
      headers.forEach((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...excelData.map(row => String(row[header] || '').length)
        );
        columnWidths[index] = { wch: Math.min(maxLength + 2, 50) }; // Cap at 50 characters
      });
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Set response headers for file download
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const filename = `HR_Applications_Summary_${timestamp}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', excelBuffer.length);

      console.log(`Excel export completed: ${filename}`);
      
      // Send the Excel file
      res.send(excelBuffer);

    } catch (error) {
      console.error('Excel export error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export applications to Excel'
      });
    }
  }
}

module.exports = ApplicationController;

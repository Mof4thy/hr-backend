'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Applications table (main table)
    await queryInterface.createTable('Applications', {
      applicationId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      jobTitle: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      cvPath: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'pending'
      },
      submittedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create PersonalInfo table
    await queryInterface.createTable('PersonalInfo', {
      personalInfoId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Applications',
          key: 'applicationId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      dateOfBirth: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      placeOfBirth: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      nationalId: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      nationality: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      phoneNumber: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      mobileNumber: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      emergencyNumber: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      militaryServiceStatus: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      socialStatus: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      hasVehicle: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      drivingLicense: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      profileImagePath: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    });

    // Create Experiences table
    await queryInterface.createTable('Experiences', {
      experienceId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Applications',
          key: 'applicationId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      company: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      location: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      role: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      salary: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      fromDate: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      toDate: {
        type: Sequelize.STRING(50),
        allowNull: true
      }
    });

    // Create CurrentJobs table
    await queryInterface.createTable('CurrentJobs', {
      currentJobId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Applications',
          key: 'applicationId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      isCurrentlyEmployed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      company: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      role: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      salary: {
        type: Sequelize.STRING(50),
        allowNull: true
      }
    });

    // Create PredefinedSkills table
    await queryInterface.createTable('PredefinedSkills', {
      predefinedSkillsId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Applications',
          key: 'applicationId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      word: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      excel: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      powerpoint: {
        type: Sequelize.STRING(50),
        allowNull: true
      }
    });

    // Create CustomSkills table
    await queryInterface.createTable('CustomSkills', {
      customSkillId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Applications',
          key: 'applicationId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      level: {
        type: Sequelize.STRING(50),
        allowNull: false
      }
    });

    // Create Languages table
    await queryInterface.createTable('Languages', {
      languagesId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Applications',
          key: 'applicationId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      english: {
        type: Sequelize.STRING(50),
        allowNull: true
      }
    });

    // Create AdditionalLanguages table
    await queryInterface.createTable('AdditionalLanguages', {
      additionalLanguageId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Applications',
          key: 'applicationId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      level: {
        type: Sequelize.STRING(50),
        allowNull: false
      }
    });

    // Create CompanyRelationships table
    await queryInterface.createTable('CompanyRelationships', {
      companyRelationshipsId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Applications',
          key: 'applicationId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      hasRelationship: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      contactName: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      contactPosition: {
        type: Sequelize.STRING(150),
        allowNull: true
      }
    });

    // Create Education table
    await queryInterface.createTable('Education', {
      educationId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      applicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Applications',
          key: 'applicationId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      institution: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      department: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      grade: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      fromDate: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      toDate: {
        type: Sequelize.STRING(50),
        allowNull: true
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('Applications', ['jobTitle']);
    await queryInterface.addIndex('Applications', ['status']);
    await queryInterface.addIndex('Applications', ['submittedAt']);
    await queryInterface.addIndex('PersonalInfo', ['applicationId']);
    await queryInterface.addIndex('PersonalInfo', ['name']);
    await queryInterface.addIndex('Experiences', ['applicationId']);
    await queryInterface.addIndex('CurrentJobs', ['applicationId']);
    await queryInterface.addIndex('Education', ['applicationId']);
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order (to handle foreign key constraints)
    await queryInterface.dropTable('Education');
    await queryInterface.dropTable('CompanyRelationships');
    await queryInterface.dropTable('AdditionalLanguages');
    await queryInterface.dropTable('Languages');
    await queryInterface.dropTable('CustomSkills');
    await queryInterface.dropTable('PredefinedSkills');
    await queryInterface.dropTable('CurrentJobs');
    await queryInterface.dropTable('Experiences');
    await queryInterface.dropTable('PersonalInfo');
    await queryInterface.dropTable('Applications');
  }
};

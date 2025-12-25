'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    static associate(models) {
      // One-to-One relationships
      Application.hasOne(models.PersonalInfo, {
        foreignKey: 'applicationId',
        as: 'personalInfo'
      });
      
      Application.hasOne(models.CurrentJob, {
        foreignKey: 'applicationId',
        as: 'currentJob'
      });
      
      Application.hasOne(models.PredefinedSkills, {
        foreignKey: 'applicationId',
        as: 'predefinedSkills'
      });
      
      Application.hasOne(models.Languages, {
        foreignKey: 'applicationId',
        as: 'languages'
      });
      
      Application.hasOne(models.CompanyRelationships, {
        foreignKey: 'applicationId',
        as: 'companyRelationships'
      });

      // One-to-Many relationships
      Application.hasMany(models.Experience, {
        foreignKey: 'applicationId',
        as: 'experiences'
      });
      
      Application.hasMany(models.Education, {
        foreignKey: 'applicationId',
        as: 'education'
      });
      
      Application.hasMany(models.CustomSkill, {
        foreignKey: 'applicationId',
        as: 'customSkills'
      });
      
      Application.hasMany(models.AdditionalLanguage, {
        foreignKey: 'applicationId',
        as: 'additionalLanguages'
      });
    }
  }

  Application.init({
    applicationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    // Job Information
    jobTitle: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    
    // Education Status
    educationStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [[
          'higher-qualification',
          'above-intermediate-qualification',
          'preparatory',
          'primary',
          'illiterate',
          'no-qualification'
        ]]
      }
    },
    
    // Files
    cvPath: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    
    // Application Status
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'reviewed', 'accepted', 'rejected', 'accepted_for_interview', 'accepted_to_join']]
      }
    },
    
    // Additional Comments
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Timestamps
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Application',
    tableName: 'Applications',
    timestamps: true
  });

  return Application;
};

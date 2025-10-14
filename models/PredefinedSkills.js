'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PredefinedSkills extends Model {
    static associate(models) {
      PredefinedSkills.belongsTo(models.Application, {
        foreignKey: 'applicationId',
        as: 'application'
      });
    }
  }

  PredefinedSkills.init({
    predefinedSkillsId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Applications',
        key: 'applicationId'
      }
    },
    word: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [['weak', 'good', 'very_good', 'excellent']]
      }
    },
    excel: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [['weak', 'good', 'very_good', 'excellent']]
      }
    },
    powerpoint: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [['weak', 'good', 'very_good', 'excellent']]
      }
    }
  }, {
    sequelize,
    modelName: 'PredefinedSkills',
    tableName: 'PredefinedSkills',
    timestamps: false
  });

  return PredefinedSkills;
};

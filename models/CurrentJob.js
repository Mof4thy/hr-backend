'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CurrentJob extends Model {
    static associate(models) {
      CurrentJob.belongsTo(models.Application, {
        foreignKey: 'applicationId',
        as: 'application'
      });
    }
  }

  CurrentJob.init({
    currentJobId: {
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
    isCurrentlyEmployed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    company: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    role: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    salary: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'CurrentJob',
    tableName: 'CurrentJobs',
    timestamps: false
  });

  return CurrentJob;
};

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Experience extends Model {
    static associate(models) {
      Experience.belongsTo(models.Application, {
        foreignKey: 'applicationId',
        as: 'application'
      });
    }
  }

  Experience.init({
    experienceId: {
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
    company: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    role: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    salary: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    fromDate: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    toDate: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Experience',
    tableName: 'Experiences',
    timestamps: false
  });

  return Experience;
};

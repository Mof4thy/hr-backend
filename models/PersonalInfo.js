'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PersonalInfo extends Model {
    static associate(models) {
      PersonalInfo.belongsTo(models.Application, {
        foreignKey: 'applicationId',
        as: 'application'
      });
    }
  }

  PersonalInfo.init({
    personalInfoId: {
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
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    dateOfBirth: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    placeOfBirth: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nationalId: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    nationality: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    whatsappNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    mobileNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    emergencyNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    militaryServiceStatus: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    socialStatus: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    hasVehicle: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    drivingLicense: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    profileImagePath: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PersonalInfo',
    tableName: 'PersonalInfo',
    timestamps: false
  });

  return PersonalInfo;
};

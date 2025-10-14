'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CompanyRelationships extends Model {
    static associate(models) {
      CompanyRelationships.belongsTo(models.Application, {
        foreignKey: 'applicationId',
        as: 'application'
      });
    }
  }

  CompanyRelationships.init({
    companyRelationshipsId: {
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
    hasRelationship: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    contactName: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    contactPosition: {
      type: DataTypes.STRING(150),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'CompanyRelationships',
    tableName: 'CompanyRelationships',
    timestamps: false
  });

  return CompanyRelationships;
};

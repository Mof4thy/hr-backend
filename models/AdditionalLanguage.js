'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AdditionalLanguage extends Model {
    static associate(models) {
      AdditionalLanguage.belongsTo(models.Application, {
        foreignKey: 'applicationId',
        as: 'application'
      });
    }
  }

  AdditionalLanguage.init({
    additionalLanguageId: {
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
      type: DataTypes.STRING(100),
      allowNull: false
    },
    level: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['beginner', 'intermediate', 'advanced', 'fluent', 'native']]
      }
    }
  }, {
    sequelize,
    modelName: 'AdditionalLanguage',
    tableName: 'AdditionalLanguages',
    timestamps: false
  });

  return AdditionalLanguage;
};

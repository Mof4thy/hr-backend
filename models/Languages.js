'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Languages extends Model {
    static associate(models) {
      Languages.belongsTo(models.Application, {
        foreignKey: 'applicationId',
        as: 'application'
      });
    }
  }

  Languages.init({
    languagesId: {
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
    english: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [['beginner', 'intermediate', 'advanced', 'fluent', 'native']]
      }
    }
  }, {
    sequelize,
    modelName: 'Languages',
    tableName: 'Languages',
    timestamps: false
  });

  return Languages;
};

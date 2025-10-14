'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CustomSkill extends Model {
    static associate(models) {
      CustomSkill.belongsTo(models.Application, {
        foreignKey: 'applicationId',
        as: 'application'
      });
    }
  }

  CustomSkill.init({
    customSkillId: {
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
        isIn: [['weak', 'good', 'very_good', 'excellent']]
      }
    }
  }, {
    sequelize,
    modelName: 'CustomSkill',
    tableName: 'CustomSkills',
    timestamps: false
  });

  return CustomSkill;
};

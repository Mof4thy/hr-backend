'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Applications', 'educationStatus', {
      type: Sequelize.STRING(20),
      allowNull: true,
      validate: {
        isIn: [['student', 'graduate']]
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Applications', 'educationStatus');
  }
};

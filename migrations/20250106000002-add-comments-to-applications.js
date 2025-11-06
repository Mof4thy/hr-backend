'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Applications', 'comments', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Additional comments from the applicant'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Applications', 'comments');
  }
};

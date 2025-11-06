'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('PersonalInfo', 'sex', {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: 'Gender/Sex of the applicant (Male/Female/Other)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('PersonalInfo', 'sex');
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add age field
    await queryInterface.addColumn('PersonalInfo', 'age', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Age of the applicant (calculated from date of birth)'
    });

    // Add area field
    await queryInterface.addColumn('PersonalInfo', 'area', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Area/District where the applicant lives'
    });

    // Add email field
    await queryInterface.addColumn('PersonalInfo', 'email', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Email address of the applicant (optional)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('PersonalInfo', 'age');
    await queryInterface.removeColumn('PersonalInfo', 'area');
    await queryInterface.removeColumn('PersonalInfo', 'email');
  }
};

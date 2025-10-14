'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename phoneNumber column to whatsappNumber in PersonalInfo table
    await queryInterface.renameColumn('PersonalInfo', 'phoneNumber', 'whatsappNumber');
  },

  async down(queryInterface, Sequelize) {
    // Revert the change by renaming whatsappNumber back to phoneNumber
    await queryInterface.renameColumn('PersonalInfo', 'whatsappNumber', 'phoneNumber');
  }
};

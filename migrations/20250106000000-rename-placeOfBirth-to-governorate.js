'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('PersonalInfo', 'placeOfBirth', 'governorate');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('PersonalInfo', 'governorate', 'placeOfBirth');
  }
};


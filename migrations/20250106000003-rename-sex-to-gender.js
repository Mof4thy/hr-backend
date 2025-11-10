'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('PersonalInfo', 'sex', 'gender');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('PersonalInfo', 'gender', 'sex');
  }
};

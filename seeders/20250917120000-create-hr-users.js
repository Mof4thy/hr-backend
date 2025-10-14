'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords for default HR users
    const saltRounds = 12;
    const adminPassword = await bcrypt.hash('Admin@123', saltRounds);
    const hrPassword = await bcrypt.hash('Hr@123', saltRounds);
    const recruiterPassword = await bcrypt.hash('Recruiter@123', saltRounds);

    await queryInterface.bulkInsert('HRUsers', [
      {
        username: 'admin',
        email: 'admin@company.com',
        fullName: 'System Administrator',
        passwordHash: adminPassword,
        role: 'Admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'hr_manager',
        email: 'hr.manager@company.com',
        fullName: 'HR Manager',
        passwordHash: hrPassword,
        role: 'HR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'recruiter1',
        email: 'recruiter1@company.com',
        fullName: 'Senior Recruiter',
        passwordHash: recruiterPassword,
        role: 'Recruiter',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('HRUsers', {
      username: {
        [Sequelize.Op.in]: ['admin', 'hr_manager', 'recruiter1']
      }
    }, {});
  }
};

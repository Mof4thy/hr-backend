const { Sequelize } = require('sequelize');

// Database connection test and creation utility
const sequelize = new Sequelize('hr_management_db', 'sa', '123', {
  host: 'localhost',
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection successful');
    
    // List all tables
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    console.log('📋 Existing tables:');
    results.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });
    
    // Create HRUsers table if it doesn't exist (for emergency recovery)
    const hrUsersExists = results.some(table => table.TABLE_NAME === 'HRUsers');
    
    if (!hrUsersExists) {
      console.log('⚠️  HRUsers table missing, creating...');
      await sequelize.query(`
        CREATE TABLE HRUsers (
          userId INT IDENTITY(1,1) PRIMARY KEY,
          username NVARCHAR(150) NOT NULL UNIQUE,
          email NVARCHAR(255) NOT NULL UNIQUE,
          fullName NVARCHAR(200) NOT NULL,
          passwordHash NVARCHAR(255) NOT NULL,
          role NVARCHAR(50) NOT NULL DEFAULT 'HR',
          isActive BIT NOT NULL DEFAULT 1,
          createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
          updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
        )
      `);
      console.log('✅ HRUsers table created');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
})();

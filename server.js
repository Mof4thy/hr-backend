const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

// Test database connection
const startServer = async () => {

  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      console.log('✅ Database models synchronized.');
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 HR Backend Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Database: ${process.env.DB_NAME || 'hr_management_db'}`);
    });

  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

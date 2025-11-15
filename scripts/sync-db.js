require('dotenv').config();
const db = require('../models');

const syncDatabase = async () => {
  try {
    console.log('Testing database connection...');
    await db.sequelize.authenticate();
    console.log(' Database connection established successfully.');

    console.log('Starting database synchronization...');
    
    // Use { force: true } only in development to drop and recreate tables
    const syncOptions = { 
      force: process.env.NODE_ENV === 'development' 
    };
    
    await db.sequelize.sync(syncOptions);
    console.log(' Database synchronized successfully.');

    // Always run seed data after sync
    console.log(' Running seed data...');
    await require('./seed-data')();

    console.log(' Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(' Database synchronization failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  syncDatabase();
}

module.exports = syncDatabase;
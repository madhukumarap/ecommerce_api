const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');

    await db.sequelize.sync({ force: false });
    console.log('Database synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Prevent server from starting during tests
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;

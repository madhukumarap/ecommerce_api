const { sequelize, connectDB } = require('../config/database');
const { Sequelize } = require('sequelize');

const db = {
  sequelize,
  Sequelize,
  User: require('./User')(sequelize, Sequelize),
  Category: require('./Category')(sequelize, Sequelize),
  Product: require('./Product')(sequelize, Sequelize),
  Cart: require('./Cart')(sequelize, Sequelize),
  CartItem: require('./CartItem')(sequelize, Sequelize),
  Order: require('./Order')(sequelize, Sequelize),
  OrderItem: require('./OrderItem')(sequelize, Sequelize)
};

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;

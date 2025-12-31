const { sequelize } = require('../config/database');
const UserModel = require('./User');
const IOCModel = require('./IOC');

const User = UserModel(sequelize);
const IOC = IOCModel(sequelize);

const initializeDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✓ Database synchronized');

    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      await User.create({
        username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@iochub.local',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
        role: 'admin',
      });
      console.log('✓ Default admin user created');
    }
  } catch (error) {
    console.error('✗ Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  User,
  IOC,
  sequelize,
  initializeDatabase,
};
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'smartweld',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'vassu',
  {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',

    logging:
      process.env.NODE_ENV === 'development'
        ? console.log
        : false,

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = { sequelize, connectDB };

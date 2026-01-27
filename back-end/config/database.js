/* eslint-env node */
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'pup_sinag',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    dialect: 'mysql',
    // Enable logging during diagnosis so we can see connection attempts
    logging: console.log,
  },
);

module.exports = sequelize;

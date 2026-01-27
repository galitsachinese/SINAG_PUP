/* eslint-env node */
const { Sequelize } = require('sequelize');
require('dotenv').config();

// ✅ Support both MySQL (local) and PostgreSQL (Supabase)
// Detect dialect based on environment or default to postgres for production
const isDevelopment = process.env.NODE_ENV === 'development';
const dialect = isDevelopment ? 'mysql' : 'postgres';

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'pup_sinag',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || (dialect === 'postgres' ? 5432 : 3306)),
    dialect: dialect,
    // ✅ PostgreSQL SSL for Supabase
    dialectOptions: dialect === 'postgres' ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    // Enable logging during diagnosis so we can see connection attempts
    logging: console.log,
  },
);

module.exports = sequelize;

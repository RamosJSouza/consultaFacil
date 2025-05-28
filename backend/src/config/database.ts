import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_NAME = 'consultafacil',
  DB_USER = 'postgres',
  DB_PASSWORD = 'root',
  DB_HOST = 'localhost',
  DB_PORT = '5432',
} = process.env;

if (!DB_PASSWORD) {
  throw new Error('Database password not set in environment variables');
}

export const sequelize = new Sequelize({
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

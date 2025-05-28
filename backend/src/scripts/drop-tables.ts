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

async function dropTables() {
  const sequelize = new Sequelize({
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    dialect: 'postgres',
  });

  try {
    // Drop all tables
    await sequelize.getQueryInterface().dropAllTables();
    console.log('All tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
  } finally {
    await sequelize.close();
  }
}

dropTables(); 
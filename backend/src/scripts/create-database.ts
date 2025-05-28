import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_USER = 'postgres',
  DB_PASSWORD = 'root',
  DB_HOST = 'localhost',
  DB_PORT = '5432',
} = process.env;

async function createDatabase() {
  // Connect to default postgres database first
  const sequelize = new Sequelize({
    database: 'postgres',
    username: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    dialect: 'postgres',
  });

  try {
    // Create the consultafacil database
    await sequelize.query('CREATE DATABASE consultafacil;');
    console.log('Database consultafacil created successfully');
  } catch (error: any) {
    if (error.original?.code === '42P04') {
      console.log('Database consultafacil already exists');
    } else {
      console.error('Error creating database:', error);
    }
  } finally {
    await sequelize.close();
  }
}

createDatabase(); 
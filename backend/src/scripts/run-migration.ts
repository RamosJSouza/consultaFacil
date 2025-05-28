import { Sequelize } from 'sequelize';
import { up } from '../migrations/fix-updated-at';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_NAME = 'postgres',
  DB_USER = 'postgres',
  DB_PASSWORD = 'root',
  DB_HOST = 'localhost',
  DB_PORT = '5432',
} = process.env;

async function runMigration() {
  const sequelize = new Sequelize({
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    dialect: 'postgres',
  });

  try {
    await up(sequelize.getQueryInterface());
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration(); 
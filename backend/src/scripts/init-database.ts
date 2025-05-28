import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_NAME = 'consultafacil',
  DB_USER = 'postgres',
  DB_PASSWORD = 'root',
  DB_HOST = 'localhost',
  DB_PORT = '5432',
} = process.env;

async function initDatabase() {
  const sequelize = new Sequelize({
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    dialect: 'postgres',
  });

  try {
    // Create users table
    await sequelize.getQueryInterface().createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      specialty: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      licenseNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      }
    });

    console.log('Database tables created successfully');
  } catch (error: any) {
    if (error.original?.code === '42P07') {
      console.log('Tables already exist');
    } else {
      console.error('Error initializing database:', error);
    }
  } finally {
    await sequelize.close();
  }
}

initDatabase(); 
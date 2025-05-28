import { sequelize } from '../config/database';
import User from '../models/User';

async function listTables() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // List all tables
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('Tables in database:');
    console.log(tables);
    
    // Check if users table exists and has records
    if (tables.includes('users')) {
      const users = await User.findAll();
      console.log(`Total users: ${users.length}`);
      if (users.length > 0) {
        console.log('User records:');
        users.forEach(user => {
          console.log({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            isActive: user.isActive,
            createdAt: user.createdAt
          });
        });
      } else {
        console.log('No user records found.');
      }
    } else {
      console.log('Users table does not exist.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listTables(); 
import { sequelize } from '../config/database';
import User from '../models/User';

async function deleteUser(email: string) {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      process.exit(0);
    }
    
    // Delete user
    await user.destroy();
    console.log(`User with email ${email} has been deleted.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument.');
  console.log('Example: npx ts-node ./src/scripts/delete-user.ts example@email.com');
  process.exit(1);
}

deleteUser(email); 
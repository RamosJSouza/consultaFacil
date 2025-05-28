const { sequelize } = require('./dist/config/database'); 
const User = require('./dist/models/User').default;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection established');
    
    const users = await User.findAll();
    console.log('Total users:', users.length);
    console.log('Users:', JSON.stringify(users.map(u => ({ 
      id: u.id, 
      email: u.email, 
      role: u.role 
    })), null, 2));
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})(); 
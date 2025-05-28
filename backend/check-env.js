require('dotenv').config();

console.log('Environment variables check:');
console.log('=============================');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✅' : 'Not set ❌');
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'Set ✅' : 'Not set ❌');
console.log('JWT_ACCESS_EXPIRATION:', process.env.JWT_ACCESS_EXPIRATION ? 'Set ✅' : 'Not set ❌');
console.log('JWT_REFRESH_EXPIRATION:', process.env.JWT_REFRESH_EXPIRATION ? 'Set ✅' : 'Not set ❌');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set ❌');
console.log('DB_HOST:', process.env.DB_HOST || 'Not set ❌');
console.log('DB_NAME:', process.env.DB_NAME || 'Not set ❌');
console.log('=============================');

// Check .env file path
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');

console.log('.env file exists:', fs.existsSync(envPath) ? 'Yes ✅' : 'No ❌');
if (fs.existsSync(envPath)) {
  console.log('.env file path:', envPath);
  console.log('.env file contents:');
  console.log('=============================');
  console.log(fs.readFileSync(envPath, 'utf8'));
  console.log('=============================');
} 
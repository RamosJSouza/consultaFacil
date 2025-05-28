const fs = require('fs');
const path = require('path');

// Define new .env content with strong JWT secrets
const envContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=consultafacil
DB_USER=postgres
DB_PASSWORD=root

# JWT Configuration
JWT_SECRET=super-secure-jwt-secret-key-for-access-token
JWT_REFRESH_SECRET=super-secure-jwt-secret-key-for-refresh-token
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# API URL
API_URL=http://localhost:3000

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=logs`;

// Write to .env file
const envPath = path.join(__dirname, '.env');
fs.writeFileSync(envPath, envContent);

console.log('.env file updated successfully with secure JWT secrets!');
console.log('Location:', envPath); 
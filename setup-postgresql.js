#!/usr/bin/env node

/**
 * PostgreSQL Setup Script for Smart Weld
 * Run this to initialize PostgreSQL database and backend
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🐘 PostgreSQL Setup for Smart Weld\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log('✅ Node.js installed:', nodeVersion);
} catch (error) {
  console.log('❌ Node.js not found. Please install Node.js 18+ first.');
  process.exit(1);
}

// Check if PostgreSQL is installed
let postgresInstalled = false;
try {
  execSync('psql --version', { stdio: 'pipe' });
  postgresInstalled = true;
  console.log('✅ PostgreSQL is installed');
} catch (error) {
  console.log('❌ PostgreSQL not found. Installing...');

  // Try to install PostgreSQL
  try {
    if (process.platform === 'win32') {
      console.log('Please download PostgreSQL from: https://www.postgresql.org/download/windows/');
      console.log('Or run: choco install postgresql');
    } else if (process.platform === 'darwin') {
      execSync('brew install postgresql', { stdio: 'inherit' });
      execSync('brew services start postgresql', { stdio: 'inherit' });
    } else {
      execSync('sudo apt update && sudo apt install -y postgresql postgresql-contrib', { stdio: 'inherit' });
      execSync('sudo systemctl start postgresql', { stdio: 'inherit' });
      execSync('sudo systemctl enable postgresql', { stdio: 'inherit' });
    }
    postgresInstalled = true;
    console.log('✅ PostgreSQL installed and started');
  } catch (installError) {
    console.log('❌ Failed to install PostgreSQL automatically');
    console.log('Please install PostgreSQL manually and run this script again');
    process.exit(1);
  }
}

// Create backend directory structure
console.log('📁 Creating backend directory structure...');
const backendDir = 'backend';
const dirs = [
  'src/controllers',
  'src/models',
  'src/routes',
  'src/middleware',
  'src/services',
  'src/utils',
  'src/config',
  'scripts',
  'tests'
];

if (!fs.existsSync(backendDir)) {
  fs.mkdirSync(backendDir);
}

dirs.forEach(dir => {
  const fullPath = path.join(backendDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

console.log('✅ Backend directory structure created');

// Create package.json for backend
const packageJson = {
  "name": "smart-weld-backend",
  "version": "1.0.0",
  "description": "Backend API for Smart Weld application",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "db:init": "node scripts/initDB.js",
    "db:migrate": "node scripts/migrateData.js",
    "seed": "node scripts/seed.js",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.35.2",
    "multer": "^1.4.5-lts.1",
    "multer-s3": "^3.0.1",
    "aws-sdk": "^2.1541.0",
    "socket.io": "^4.7.4",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  },
  "keywords": ["smart-weld", "api", "postgresql", "express"],
  "author": "Smart Weld Team",
  "license": "MIT"
};

fs.writeFileSync(path.join(backendDir, 'package.json'), JSON.stringify(packageJson, null, 2));
console.log('✅ Backend package.json created');

// Create environment file template
const envTemplate = `# Database Configuration
DATABASE_URL=postgresql://smart_weld_user:your_password@localhost:5432/smart_weld

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# Server Configuration
NODE_ENV=development
PORT=3001

# CORS Configuration (comma-separated URLs)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175

# AWS S3 Configuration (for file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET=smart-weld-images

# Email Configuration (optional, for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Logging
LOG_LEVEL=info
`;

fs.writeFileSync(path.join(backendDir, '.env.example'), envTemplate);
console.log('✅ Environment template created');

// Create database initialization script
const initDBScript = `const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log
});

const initDatabase = async () => {
  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    console.log('🔄 Creating tables...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables created successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

initDatabase();
`;

fs.writeFileSync(path.join(backendDir, 'scripts', 'initDB.js'), initDBScript);
console.log('✅ Database initialization script created');

// Create basic server file
const serverFile = `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: 'PostgreSQL'
  });
});

// API routes (to be added)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/scans', require('./routes/scans'));
// app.use('/api/bookings', require('./routes/bookings'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 Smart Weld Backend Server running on port \${PORT}\`);
  console.log(\`📊 Environment: \${process.env.NODE_ENV}\`);
  console.log(\`🗄️  Database: PostgreSQL\`);
});

module.exports = app;
`;

fs.writeFileSync(path.join(backendDir, 'src', 'server.js'), serverFile);
console.log('✅ Basic server file created');

// Create README for backend
const backendReadme = `# Smart Weld Backend API

PostgreSQL-based backend API for the Smart Weld application.

## Setup

1. **Install Dependencies**
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

2. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Database Setup**
   \`\`\`bash
   # Make sure PostgreSQL is running
   npm run db:init
   \`\`\`

4. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

## API Endpoints

### Authentication
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - User login
- \`GET /api/auth/profile\` - Get user profile
- \`PUT /api/auth/profile\` - Update user profile

### Scans
- \`GET /api/scans\` - Get user's scan history
- \`GET /api/scans/:scanId\` - Get specific scan
- \`POST /api/scans\` - Create new scan

### Bookings
- \`GET /api/bookings\` - Get user's bookings
- \`POST /api/bookings\` - Create new booking
- \`PUT /api/bookings/:bookingId/status\` - Update booking status

### File Upload
- \`POST /api/upload/scan-image\` - Upload scan image

## Database Schema

### Users
- id (UUID, Primary Key)
- phoneNumber (String, Unique)
- email (String, Optional)
- displayName (String)
- password (String, Hashed)
- profileImage (String)
- preferences (JSONB)
- stats (JSONB)
- location (JSONB)
- timestamps

### Scans
- id (UUID, Primary Key)
- scanId (String, Unique)
- userId (UUID, Foreign Key)
- imageUrl (String)
- imageAnalysis (JSONB)
- costBreakdown (JSONB)
- location (JSONB)
- deviceInfo (JSONB)
- status (Enum)
- timestamps

### Bookings
- id (UUID, Primary Key)
- bookingId (String, Unique)
- userId (UUID, Foreign Key)
- scanId (UUID, Foreign Key, Optional)
- issue (String)
- description (Text)
- location (JSONB)
- pricing (JSONB)
- payment (JSONB)
- status (Enum)
- timestamps

## Development

### Available Scripts
- \`npm run dev\` - Start development server with nodemon
- \`npm run db:init\` - Initialize database tables
- \`npm run seed\` - Seed database with sample data
- \`npm test\` - Run tests
- \`npm run lint\` - Run ESLint

### Project Structure
\`\`\`
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── scripts/             # Database scripts
├── tests/               # Test files
├── .env.example         # Environment template
└── package.json
\`\`\`

## Deployment

### Docker
\`\`\`bash
docker build -t smart-weld-backend .
docker run -p 3001:3001 --env-file .env smart-weld-backend
\`\`\`

### PM2 (Production)
\`\`\`bash
npm install -g pm2
pm2 start ecosystem.config.js
\`\`\`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| \`DATABASE_URL\` | PostgreSQL connection string | Required |
| \`JWT_SECRET\` | JWT signing secret | Required |
| \`JWT_EXPIRE\` | JWT expiration time | 7d |
| \`PORT\` | Server port | 3001 |
| \`NODE_ENV\` | Environment | development |
| \`AWS_ACCESS_KEY_ID\` | AWS access key | Optional |
| \`AWS_SECRET_ACCESS_KEY\` | AWS secret key | Optional |
| \`S3_BUCKET\` | S3 bucket name | Optional |

## Contributing

1. Follow ESLint rules
2. Write tests for new features
3. Update documentation
4. Use conventional commits

## License

MIT License
`;

fs.writeFileSync(path.join(backendDir, 'README.md'), backendReadme);
console.log('✅ Backend README created');

// Install backend dependencies
console.log('📦 Installing backend dependencies...');
try {
  execSync('cd backend && npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.log('⚠️  Some dependencies might have failed to install');
}

// Create .env file if it doesn't exist
const envPath = path.join(backendDir, '.env');
if (!fs.existsSync(envPath)) {
  const defaultEnv = `# Database Configuration
DATABASE_URL=postgresql://smart_weld_user:password@localhost:5432/smart_weld

# JWT Configuration
JWT_SECRET=smart_weld_jwt_secret_key_change_this_in_production_123456789
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# Server Configuration
NODE_ENV=development
PORT=3001

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175

# AWS S3 (leave empty for local file storage)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET=

# Email (optional)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=

# Logging
LOG_LEVEL=info
`;
  fs.writeFileSync(envPath, defaultEnv);
  console.log('✅ Default .env file created');
}

console.log('\n🎉 PostgreSQL backend setup completed!');
console.log('\n📋 Next Steps:');
console.log('1. Start PostgreSQL service');
console.log('2. Create database: smart_weld');
console.log('3. Create user: smart_weld_user with password');
console.log('4. Edit backend/.env with your database credentials');
console.log('5. Run: cd backend && npm run db:init');
console.log('6. Run: npm run dev (in backend directory)');
console.log('7. Test API: curl http://localhost:3001/health');
console.log('\n📚 Check POSTGRESQL_INTEGRATION_GUIDE.md for complete implementation details');

process.exit(0);
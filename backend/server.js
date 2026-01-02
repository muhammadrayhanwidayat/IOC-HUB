const express = require('express');
const cors = require('cors'); //agar frontend bisa akses API
const path = require('path');
require('dotenv').config(); //load .env ke process.env

const { testConnection } = require('./config/database'); // setup koneksi Sequelize
const { initializeDatabase } = require('./models'); // bakal inisialisasi DB dan buat admin default dari index.js

const authRoutes = require('./routes/auth'); //login, register, refresh token
const iocRoutes = require('./routes/ioc'); //manage IOC
const urlhausRoutes = require('./routes/urlhaus'); //proxy / fetch data dari URLhaus

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); //izinkan request lintas domain
app.use(express.json()); //parsing JSON body
app.use(express.urlencoded({ extended: true })); //parsing form-data

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth', authRoutes);
app.use('/api/ioc', iocRoutes);
app.use('/api/urlhaus', urlhausRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'IOC-HUB API is running',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

//404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start the server after testing DB connection and initializing DB
const startServer = async () => {
  try {
    console.log('🚀 Starting IOC-HUB Server...');
    
    await testConnection();
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('\n📋 Default Admin Credentials:');
      console.log(`   Username: ${process.env.DEFAULT_ADMIN_USERNAME || 'admin'}`);
      console.log(`   Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}`);
      console.log('\n⚠️  Please change the default admin password after first login!\n');
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
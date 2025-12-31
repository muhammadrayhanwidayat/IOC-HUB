const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { initializeDatabase } = require('./models');

const authRoutes = require('./routes/auth');
const iocRoutes = require('./routes/ioc');
const urlhausRoutes = require('./routes/urlhaus');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth', authRoutes);
app.use('/api/ioc', iocRoutes);
app.use('/api/urlhaus', urlhausRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'IOC-HUB API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

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
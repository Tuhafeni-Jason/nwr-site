const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

// Route files
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');
const revenue = require('./routes/revenue');
const security = require('./routes/security');
const admin = require('./routes/admin');

// Middleware
const { securityHeaders, sanitizeInput, requestLogger } = require('./middleware/security');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());
app.use(securityHeaders);
app.use(sanitizeInput);
app.use(requestLogger);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', auth);
app.use('/api/bookings', bookings);
app.use('/api/revenue', revenue);
app.use('/api/security-logs', security);
app.use('/api/admin', admin);

// Honeypot endpoint - fake admin secret route
app.use('/api/admin-secret', require('./routes/security'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'NWR Secure Booking API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 NWR Secure Booking API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security features enabled`);
  console.log(`\n📌 API Endpoints:`);
  console.log(`   POST   /api/auth/register     - Register new user`);
  console.log(`   POST   /api/auth/login        - Login`);
  console.log(`   GET    /api/auth/me           - Get current user`);
  console.log(`   GET    /api/bookings          - Get all bookings`);
  console.log(`   POST   /api/bookings          - Create booking`);
  console.log(`   GET    /api/revenue/dashboard - Revenue analytics`);
  console.log(`   GET    /api/security-logs     - Security logs`);
  console.log(`   GET    /api/admin/dashboard   - Admin dashboard`);
  console.log(`   GET    /api/admin-secret      - 🍯 HONEYPOT (DO NOT ACCESS)`);
  console.log(`\n💡 Run 'npm run seed' to populate demo data\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;

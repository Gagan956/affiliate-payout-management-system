const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const userRoutes = require('./routes/user.routes');
const saleRoutes = require('./routes/sale.routes');
const withdrawalRoutes = require('./routes/withdrawal.routes');
const payoutRoutes = require('./routes/payout.routes');
const logger = require('./config/logger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// routes
app.use('/api', userRoutes);
app.use('/api', saleRoutes);
app.use('/api', withdrawalRoutes);
app.use('/api', payoutRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'User Payout Management System API',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Global error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

module.exports = app;
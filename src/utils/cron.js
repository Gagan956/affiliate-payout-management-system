const cron = require('node-cron');
const logger = require('../config/logger');
const { processAdvancePayouts } = require('../services/advancePayout.service');
const { formatCurrency } = require('./helpers');

const startAdvancePayoutCron = () => {

  const task = cron.schedule('*/30 * * * *', async () => {
    try {
      logger.info('[CRON] Starting advance payout processing');
      
      const startTime = Date.now();
      const result = await processAdvancePayouts();
      const duration = Date.now() - startTime;
      
      if (result.processed > 0) {
        logger.info(`[CRON] Advance payout completed`, {
          processed: result.processed,
          totalAmount: formatCurrency(result.totalAmount),
          duration: `${duration}ms`
        });
      } else {
        logger.info(`[CRON] No pending sales to process`, {
          duration: `${duration}ms`
        });
      }
      
    } catch (error) {
      logger.error('[CRON] Advance payout processing failed:', {
        error: error.message,
        stack: error.stack
      });
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });
  
  logger.info('[CRON] Advance payout scheduler started (runs every 30 minutes)');
  
  return task;
};

// Run immediately on startup (optional)
const runInitialAdvancePayout = async () => {
  try {
    logger.info('[STARTUP] Running initial advance payout check');
    const result = await processAdvancePayouts();
    if (result.processed > 0) {
      logger.info(`[STARTUP] Initial advance payout processed: ${result.processed} sales`);
    }
  } catch (error) {
    logger.error('[STARTUP] Initial advance payout failed:', error);
  }
};

const stopAdvancePayoutCron = (task) => {
  if (task) {
    task.stop();
    logger.info('[CRON] Advance payout scheduler stopped');
  }
};

const runAdvancePayoutNow = async (userId = null) => {
  try {
    logger.info(`[MANUAL] Running advance payout${userId ? ` for user ${userId}` : ''}`);
    
    const startTime = Date.now();
    const result = await processAdvancePayouts(userId);
    const duration = Date.now() - startTime;
    
    logger.info(`[MANUAL] Advance payout completed`, {
      processed: result.processed,
      totalAmount: formatCurrency(result.totalAmount),
      duration: `${duration}ms`
    });
    
    return result;
    
  } catch (error) {
    logger.error('[MANUAL] Advance payout failed:', error);
    throw error;
  }
};

module.exports = {
  startAdvancePayoutCron,
  stopAdvancePayoutCron,
  runAdvancePayoutNow,
  runInitialAdvancePayout
};
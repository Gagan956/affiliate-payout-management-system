const app = require('./app');
const { connectDB } = require('./config/database');
const logger = require('./config/logger');
const { startAdvancePayoutCron, runInitialAdvancePayout } = require('./utils/cron');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    
    const cronTask = startAdvancePayoutCron();
    
    setTimeout(async () => {
      await runInitialAdvancePayout();
    }, 1000);
    
    app.listen(PORT, () => {
      logger.info(` Server running on port ${PORT}`);
      logger.info(`API Documentation: http://localhost:${PORT}`);
      // logger.info(`Note: Advance payout (${process.env.ADVANCE_PAYOUT_PERCENTAGE || 10}%) is processed automatically on sale creation`);
    });
    
    global.cronTask = cronTask;
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received');
  if (global.cronTask) {
    global.cronTask.stop();
    logger.info('Cron job stopped');
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received');
  if (global.cronTask) {
    global.cronTask.stop();
    logger.info('Cron job stopped');
  }
  process.exit(0);
});

startServer();
const {
  requestWithdrawal,
  completeWithdrawal,
  failWithdrawal,
  getWithdrawalsByUser
} = require('../services/withdrawal.service');
const { recoverMultiplePayouts } = require('../services/recovery.service');
const logger = require('../config/logger');
const { validateWithdrawalData, validateBulkRecoveryData } = require('../utils/validators');


// requestWithdrawalController
const requestWithdrawalController = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const validation = validateWithdrawalData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const result = await requestWithdrawal(userId, amount);
    return res.status(200).json(result);

  } catch (error) {
    logger.error('Error requesting withdrawal:', error);
    
    if (error.message.includes('cooldown')) {
      return res.status(429).json({
        success: false,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// completeWithdrawalController
const completeWithdrawalController = async (req, res) => {
  try {
    const result = await completeWithdrawal(req.params.id);
    return res.status(200).json(result);

  } catch (error) {
    logger.error('Error completing withdrawal:', error);
    
    if (error.message.includes('already completed')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    if (error.message.includes('Not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

 //failWithdrawalController
const failWithdrawalController = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Reason is required to fail a withdrawal'
      });
    }

    const result = await failWithdrawal(req.params.id, reason);
    return res.status(200).json(result);

  } catch (error) {
    logger.error('Error failing withdrawal:', error);
    
    if (error.message.includes('already completed')) {
      return res.status(400).json({
        success: false,
        error: 'Cannot fail a completed withdrawal. The withdrawal was already completed successfully.'
      });
    }
    
    if (error.message.includes('already failed')) {
      return res.status(400).json({
        success: false,
        error: 'Withdrawal is already in failed state.'
      });
    }
    
    if (error.message.includes('Not found')) {
      return res.status(404).json({
        success: false,
        error: 'Withdrawal not found.'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// getWithdrawalsByUserController
const getWithdrawalsByUserController = async (req, res) => {
  try {
    const result = await getWithdrawalsByUser(req.params.userId);
    return res.status(200).json(result);

  } catch (error) {
    logger.error('Error fetching withdrawals:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// RecoverController
const RecoverController = async (req, res) => {
  try {
    const { withdrawalIds, reason } = req.body;

    const validation = validateBulkRecoveryData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const result = await recoverMultiplePayouts(withdrawalIds, reason || 'Bulk recovery');
    return res.status(200).json(result);

  } catch (error) {
    logger.error('Error in bulk recovery:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  requestWithdrawalController,
  completeWithdrawalController,
  failWithdrawalController,
  getWithdrawalsByUserController,
  RecoverController
};
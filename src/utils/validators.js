const validateSaleData = (data) => {
  const errors = [];

  if (!data.userId) {
    errors.push('userId is required');
  }

  if (!data.brand) {
    errors.push('brand is required');
  } else if (!['brand_1', 'brand_2', 'brand_3'].includes(data.brand)) {
    errors.push('brand must be brand_1, brand_2, or brand_3');
  }

  if (data.earning === undefined || data.earning === null) {
    errors.push('earning is required');
  } else if (data.earning <= 0) {
    errors.push('earning must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateWithdrawalData = (data) => {
  const errors = [];

  if (!data.userId) {
    errors.push('userId is required');
  }

  if (data.amount === undefined || data.amount === null) {
    errors.push('amount is required');
  } else if (data.amount <= 0) {
    errors.push('amount must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateReconciliationData = (data) => {
  const errors = [];

  if (!data.status) {
    errors.push('status is required');
  } else if (!['approved', 'rejected'].includes(data.status)) {
    errors.push('status must be approved or rejected');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateBulkRecoveryData = (data) => {
  const errors = [];

  if (!data.withdrawalIds) {
    errors.push('withdrawalIds is required');
  } else if (!Array.isArray(data.withdrawalIds)) {
    errors.push('withdrawalIds must be an array');
  } else if (data.withdrawalIds.length === 0) {
    errors.push('withdrawalIds cannot be empty');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateSaleData,
  validateWithdrawalData,
  validateReconciliationData,
  validateBulkRecoveryData
};
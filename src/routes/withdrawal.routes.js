const express = require('express');
const router = express.Router();
const {
  requestWithdrawalController,
  completeWithdrawalController,
  failWithdrawalController,
  getWithdrawalsByUserController,
  RecoverController
} = require('../controllers/withdrawal.controller');

router.post('/withdrawals', requestWithdrawalController);
router.patch('/withdrawals/:id/complete', completeWithdrawalController);
router.patch('/withdrawals/:id/fail', failWithdrawalController);
router.get('/withdrawals/:userId', getWithdrawalsByUserController);
router.post('/withdrawals/recover/bulk', RecoverController);

module.exports = router;
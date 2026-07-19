const express = require("express");
const router = express.Router();
const {
  getPayoutsByUser,
  debugDatabase,
  processAdvanceController,
} = require("../controllers/payout.controller");


// Routers
router.post("/payouts/advance", processAdvanceController);

router.get("/payouts/:userId", getPayoutsByUser);

router.get("/payouts/debug/all", debugDatabase);

module.exports = router;

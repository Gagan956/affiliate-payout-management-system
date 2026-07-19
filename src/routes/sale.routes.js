const express = require("express");
const router = express.Router();
const {
  createSaleController,
  getAllSalesController,
  getSaleByIdController,
  retryAdvanceController,
  reconcileSaleController,
} = require("../controllers/sale.controller");

// Routers
router.post("/sales", createSaleController);

router.get("/sales", getAllSalesController);

router.get("/sales/:id", getSaleByIdController);

router.patch("/sales/:id/reconcile", reconcileSaleController);

module.exports = router;

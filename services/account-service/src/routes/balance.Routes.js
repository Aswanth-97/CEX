const express = require("express");
const router = express.Router();
const balanceControllers = require("../controllers/balance.controllers");

router.get("/:accountId/balances", balanceControllers.getBalanceByAccountId);
router.post("/:accountId/balances/credit", balanceControllers.creditBalance);

module.exports = router;

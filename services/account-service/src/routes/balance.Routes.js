const express = require("express");
const router = express.Router();
const balanceControllers = require("../controllers/balance.controllers");

router.get("/:accountId/balances", balanceControllers.getBalanceByAccountId);
router.post("/:accountId/balances/credit", balanceControllers.creditBalance);
router.post("/:accountId/balances/debit", balanceControllers.debitBalance);
router.post("/:accountId/balances/lock", balanceControllers.lockBalance);
router.post("/:accountId/balances/unlock", balanceControllers.unlockBalance);

module.exports = router;

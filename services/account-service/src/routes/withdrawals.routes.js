const express = require("express");
const router = express.Router();
const withdrawalControllers = require("../controllers/withdrawal.controllers");

router.post("/:accountId/withdrawals", withdrawalControllers.createWithdrawal);
router.post(
  "/:accountId/withdrawals/:withdrawalId/process",
  withdrawalControllers.processWithdrawal,
);
router.post(
  "/:accountId/withdrawals/:withdrawalId/complete",
  withdrawalControllers.completeWithdrawal,
);

module.exports = router;

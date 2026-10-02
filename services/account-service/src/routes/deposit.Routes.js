const express = require("express");
const router = express.Router();
const depositController = require("../controllers/deposit.controllers");

router.post("/:accountId/deposits", depositController.createDeposit);
router.post(
  "/:accountId/deposits/:depositId/verify",
  depositController.verifyDeposit,
);
router.post(
  "/:accountId/deposits/:depositId/credit",
  depositController.creditDeposit,
);

module.exports = router;

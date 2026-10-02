const withdrawalService = require("../services/withdrawal.service");

const createWithdrawal = async (req, res, next) => {
  const { accountId } = req.params;
  const { assetId, destination, amount } = req.body;

  try {
    const withdrawal = await withdrawalService.createWithdrawal({
      accountId,
      assetId,
      destination,
      amount,
    });

    res
      .status(201)
      .json({ message: "Withdrawal created successfully", data: withdrawal });
  } catch (error) {
    next(error);
  }
};

const processWithdrawal = async (req, res, next) => {
  const { accountId, withdrawalId } = req.params;

  try {
    const result = await withdrawalService.processWithdrawal({
      accountId,
      withdrawalId,
    });

    res
      .status(200)
      .json({ message: "Withdrawal processed successfully", data: result });
  } catch (error) {
    next(error);
  }
};

const completeWithdrawal = async (req, res, next) => {
  const { accountId, withdrawalId } = req.params;

  try {
    const result = await withdrawalService.completeWithdrawal({
      accountId,
      withdrawalId,
    });

    res
      .status(200)
      .json({ message: "Withdrawal completed successfully", data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { createWithdrawal, processWithdrawal, completeWithdrawal };

const depositService = require("../services/deposit.service");

const createDeposit = async (req, res, next) => {
  const { accountId } = req.params;
  const { assetId, amount, txHash } = req.body;

  try {
    const deposit = await depositService.createDeposit({
      accountId,
      assetId,
      amount,
      txHash,
    });

    res
      .status(201)
      .json({ message: "Deposit created successfully", data: deposit });
  } catch (error) {
    next(error);
  }
};

const verifyDeposit = async (req, res, next) => {
  const { accountId, depositId } = req.params;

  try {
    const deposit = await depositService.verifyDeposit({
      accountId,
      depositId,
    });

    res.status(200).json({
      success: true,
      message: "Deposit verified successfully",
      data: deposit,
    });
  } catch (error) {
    next(error);
  }
};

const creditDeposit = async (req, res, next) => {
  const { accountId, depositId } = req.params;

  try {
    const result = await depositService.creditDeposit({
      accountId,
      depositId,
    });

    res.status(200).json({
      success: true,
      message: result.message || "Deposit credited successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createDeposit, verifyDeposit,creditDeposit };

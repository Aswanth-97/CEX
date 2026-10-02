const { getAssetById } = require("../repositories/asset.repository");
const balanceService = require("../services/balance.service");

const getBalanceByAccountId = async (req, res, next) => {
  const { accountId } = req.params;
  try {
    const balance = await balanceService.getBalanceByAccountId(accountId);
    res.status(200).json({
      success: true,
      data: balance,
    });
  } catch (error) {
    next(error);
  }
};

const creditBalance = async (req, res, next) => {
  const { accountId } = req.params;
  const { assetId, amount } = req.body;

  try {
    const balance = await balanceService.creditBalance({
      accountId,
      assetId,
      amount,
    });
    res.status(200).json({
      success: true,
      data: balance,
    });
  } catch (error) {
    next(error);
  }
};

const debitBalance = async (req, res, next) => {
  const { accountId } = req.params;
  const { assetId, amount } = req.body;
  try {
    const balance = await balanceService.debitBalance({
      accountId,
      assetId,
      amount,
    });
    res.status(200).json({
      message: `debited ${amount} form account ${balance.account_id}`,
      data: balance,
    });
  } catch (error) {
    next(error);
  }
};

const lockBalance = async (req, res, next) => {
  const { accountId } = req.params;
  const { assetId, amount } = req.body;
  try {
    const locked = await balanceService.lockBalance({
      accountId,
      assetId,
      amount,
    });
    res.status(200).json({
      message: "Balance locked successfully",
      data: locked,
    });
  } catch (error) {
    next(error);
  }
};

const unlockBalance = async (req, res, next) => {
  const { accountId } = req.params;
  const { assetId, amount } = req.body;
  try {
    const unlocked = await balanceService.unlockBalance({
      accountId,
      assetId,
      amount,
    });
    res.status(200).json({
      message: "amount unlocked successfully",
      data: unlocked,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBalanceByAccountId,
  creditBalance,
  debitBalance,
  lockBalance,
  unlockBalance,
};

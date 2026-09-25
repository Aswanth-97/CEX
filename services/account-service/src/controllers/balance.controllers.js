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

module.exports = { getBalanceByAccountId, creditBalance };

const balanceRepository = require("../repositories/balance.repository");

const getBalanceByAccountId = async (accountId) => {
  return balanceRepository.getBalancesByAccountId(accountId);
};

const creditBalance = async ({ accountId, assetId, amount }) => {
  return balanceRepository.creditBalance({ accountId, assetId, amount });
};

module.exports = { getBalanceByAccountId ,creditBalance};

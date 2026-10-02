const { normalizeDecimal } = require("../utils/decimal");
const logger = require("../utils/logger");

const simulatedTransactions = [
  {
    txHash: "sim_tx_001",
    assetId: "BTC",
    amount: "0.5",
    destination: "cex_btc_deposit_001",
    confirmations: 3,
  },
  {
    txHash: "sim_tx_002",
    assetId: "BTC",
    amount: "1.0",
    destination: "cex_btc_deposit_001",
    confirmations: 5,
  },
  {
    txHash: "sim_tx_pending",
    assetId: "BTC",
    amount: "0.8",
    destination: "cex_btc_deposit_001",
    confirmations: 1,
  },
];

const simulatedWithdrawals = [
  {
    txHash: "sim_withdraw_tx_001",
    assetId: "3f9ffa45-5ecb-4103-a692-487b42c8ab03",
    amount: "0.2",
    destination: "user_external_btc_address_001",
    confirmations: 3,
  },
  {
    txHash: "sim_withdraw_tx_002",
    assetId: "3f9ffa45-5ecb-4103-a692-487b42c8ab03",
    amount: "0.2",
    destination: "user_external_btc_address_002",
    confirmations: 3,
  },
  {
    txHash: "sim_withdraw_tx_pending",
    assetId: "3f9ffa45-5ecb-4103-a692-487b42c8ab03",
    amount: "0.1",
    destination: "user_external_btc_address_003",
    confirmations: 1,
  },
  {
    txHash: "sim_withdraw_tx_003",
    assetId: "3f9ffa45-5ecb-4103-a692-487b42c8ab03",
    amount: "0.2",
    destination: "user_external_btc_address_003",
    confirmations: 3,
  },
];
const getTransaction = async ({ txHash }) => {
  for (const tr of simulatedWithdrawals) {
    if (txHash === tr.txHash) {
      return tr;
    }
  }
  return null;
};

const broadcastTransaction = async ({ assetId, amount, destination }) => {
  logger.info(
    { assetId, amount, destination },
    "Provider received withdrawal request",
  );

  for (const transaction of simulatedWithdrawals) {
    logger.debug(
      {
        transaction,
      },
      "Checking simulated provider transaction",
    );

    if (
      transaction.assetId === assetId &&
      normalizeDecimal(transaction.amount) === normalizeDecimal(amount) &&
      transaction.destination === destination
    ) {
      logger.info(
        {
          txHash: transaction.txHash,
          assetId,
          amount,
          destination,
        },
        "Simulated withdrawal transaction matched",
      );

      return transaction;
    }
  }

  logger.warn(
    {
      assetId,
      amount,
      destination,
    },
    "No matching simulated withdrawal transaction found",
  );

  return null;
};

module.exports = { getTransaction, broadcastTransaction };

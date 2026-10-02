const depositRepository = require("../repositories/deposit.repository");
const accountRepository = require("../repositories/account.repository");
const assetRepository = require("../repositories/asset.repository");
const blockchainProvider = require("../providers/blockchain.provider");
const balanceRepository = require("../repositories/balance.repository");
const pool = require("../config/db");

const {
  isValidPositiveDecimal,
  getDecimalPlaces,
} = require("../utils/decimal");
const logger = require("../utils/logger");

const createDeposit = async ({ accountId, assetId, amount, txHash }) => {
  if (!isValidPositiveDecimal(amount)) {
    const error = new Error("Amount must be a positive decimal");
    error.statusCode = 400;
    throw error;
  }

  const accountCheck = await accountRepository.getAccountById({ accountId });

  if (!accountCheck) {
    const error = new Error("Account not found");
    error.statusCode = 404;
    throw error;
  }

  const assetCheck = await assetRepository.getAssetById({ assetId });

  if (!assetCheck) {
    const error = new Error("asset doesn't exist");
    error.statusCode = 404;
    throw error;
  }

  if (assetCheck.status !== "ACTIVE") {
    const error = new Error("Asset not active");
    error.statusCode = 400;
    throw error;
  }

  const amountDecimalPlaces = getDecimalPlaces(amount);

  if (amountDecimalPlaces > assetCheck.decimals) {
    const error = new Error("Amount exceeds asset decimal precision");
    error.statusCode = 400;
    throw error;
  }

  if (typeof txHash !== "string" || txHash.trim() === "") {
    const error = new Error("txHash is required");
    error.statusCode = 400;
    throw error;
  }

  const deposit = await depositRepository.createDeposit({
    accountId,
    assetId,
    amount,
    txHash,
  });

  logger.info(
    {
      depositId: deposit.id,
      accountId: deposit.account_id,
      assetId: deposit.asset_id,
      amount: deposit.amount,
      txHash: deposit.tx_hash,
    },
    "Deposit created",
  );

  return deposit;
};

const normalizeDecimal = (value) => {
  return value
    .toString()
    .replace(/(\.\d*?[1-9])0+$/, "$1")
    .replace(/\.0+$/, "");
};

const getDepositById = async ({ depositId }) => {
  return depositRepository.getDepositById({ depositId });
};

const verifyDeposit = async ({ depositId, accountId }) => {
  const deposit = await depositRepository.getDepositById({ depositId });

  if (!deposit) {
    const error = new Error("Deposit not found");
    error.statusCode = 404;
    throw error;
  }

  if (deposit.account_id !== accountId) {
    const error = new Error("Deposit not found");
    error.statusCode = 404;
    throw error;
  }

  const transaction = await blockchainProvider.getTransaction({
    txHash: deposit.tx_hash,
  });

  if (!transaction) {
    const error = new Error("Blockchain transaction not found");
    error.statusCode = 404;
    throw error;
  }

  if (transaction.txHash !== deposit.tx_hash) {
    const error = new Error("Transaction hash mismatch");
    error.statusCode = 400;
    throw error;
  }

  if (transaction.assetId !== "BTC") {
    const error = new Error("Asset mismatch");
    error.statusCode = 400;
    throw error;
  }

  if (
    normalizeDecimal(transaction.amount) !== normalizeDecimal(deposit.amount)
  ) {
    const error = new Error("Amount mismatch");
    error.statusCode = 400;
    throw error;
  }

  if (transaction.destination !== "cex_btc_deposit_001") {
    const error = new Error("Destination mismatch");
    error.statusCode = 400;
    throw error;
  }

  const requiredConfirmations = 3;

  const status =
    transaction.confirmations >= requiredConfirmations
      ? "CONFIRMED"
      : "PENDING";

  const verifiedDeposit = await depositRepository.updateDepositStatus({
    depositId,
    status,
  });

  logger.info(
    {
      depositId,
      accountId,
      txHash: deposit.tx_hash,
      confirmations: transaction.confirmations,
      status,
    },
    "Deposit blockchain transaction verified",
  );

  return verifiedDeposit;
};

const creditDeposit = async ({ depositId, accountId }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const deposit = await depositRepository.getDepositForUpdate({
      depositId,
      client,
    });

    if (!deposit) {
      const error = new Error("Deposit not found");
      error.statusCode = 404;
      throw error;
    }

    if (deposit.account_id !== accountId) {
      const error = new Error("Deposit not found");
      error.statusCode = 404;
      throw error;
    }

    if (deposit.status === "CREDITED") {
      await client.query("COMMIT");

      logger.info(
        {
          depositId: deposit.id,
          accountId,
        },
        "Deposit already credited",
      );

      return {
        deposit,
        message: "Deposit already credited",
      };
    }

    if (deposit.status !== "CONFIRMED") {
      const error = new Error("Deposit is not confirmed");
      error.statusCode = 400;
      throw error;
    }

    const balance = await balanceRepository.creditBalance({
      accountId: deposit.account_id,
      assetId: deposit.asset_id,
      amount: deposit.amount,
      client: client,
    });

    const creditedDeposit = await depositRepository.updateDepositStatus({
      depositId: deposit.id,
      status: "CREDITED",
      client,
    });

    await client.query("COMMIT");

    logger.info(
      {
        depositId: creditedDeposit.id,
        accountId: creditedDeposit.account_id,
        assetId: creditedDeposit.asset_id,
        amount: creditedDeposit.amount,
      },
      "Deposit credited",
    );

    return { deposit: creditedDeposit, balance };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createDeposit,
  getDepositById,
  verifyDeposit,
  creditDeposit,
};

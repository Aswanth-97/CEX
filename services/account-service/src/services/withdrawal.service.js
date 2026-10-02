const {
  isValidPositiveDecimal,
  getDecimalPlaces,
  normalizeDecimal,
} = require("../utils/decimal");
const withdrawalRepository = require("../repositories/withdrawals.repository");
const accountRepository = require("../repositories/account.repository");
const assetRepository = require("../repositories/asset.repository");
const balanceRepository = require("../repositories/balance.repository");
const blockchainProvider = require("../providers/blockchain.provider");
const pool = require("../config/db");
const logger = require("../utils/logger");

const createWithdrawal = async ({
  accountId,
  assetId,
  destination,
  amount,
}) => {
  if (!isValidPositiveDecimal(amount)) {
    const error = new Error("Amount must be a positive decimal");
    error.statusCode = 400;
    throw error;
  }

  if (typeof destination !== "string" || destination.trim() === "") {
    const error = new Error("Destination is required");
    error.statusCode = 400;
    throw error;
  }

  const account = await accountRepository.getAccountById({ accountId });

  if (!account) {
    const error = new Error("Account not found");
    error.statusCode = 404;
    throw error;
  }

  const asset = await assetRepository.getAssetById({ assetId });

  if (!asset) {
    const error = new Error("Asset not found");
    error.statusCode = 404;
    throw error;
  }

  if (asset.status !== "ACTIVE") {
    const error = new Error("Asset not active");
    error.statusCode = 400;
    throw error;
  }

  const amountDecimalPlaces = getDecimalPlaces(amount);

  if (amountDecimalPlaces > asset.decimals) {
    const error = new Error("Amount exceeds asset decimal precision");
    error.statusCode = 400;
    throw error;
  }

  return withdrawalRepository.createWithdrawal({
    accountId,
    assetId,
    destination: destination.trim(),
    amount,
  });

  logger.info(
    {
      withdrawalId: withdrawal.id,
      accountId,
      assetId,
      amount,
      destination: withdrawal.destination,
    },
    "Withdrawal created",
  );
};

const processWithdrawal = async ({ accountId, withdrawalId }) => {
  const client = await pool.connect();

  let withdrawal;

  let balance;

  try {
    await client.query("BEGIN");

    withdrawal = await withdrawalRepository.getWithdrawalForUpdate({
      withdrawalId,
      client,
    });

    if (!withdrawal) {
      const error = new Error("Withdrawal not found");
      error.statusCode = 404;
      throw error;
    }

    if (withdrawal.account_id !== accountId) {
      const error = new Error("Withdrawal not found");
      error.statusCode = 404;
      throw error;
    }

    if (withdrawal.status !== "PENDING") {
      const error = new Error(
        `Withdrawal cannot be processed from ${withdrawal.status} status`,
      );
      error.statusCode = 400;
      throw error;
    }

    balance = await balanceRepository.lockBalance({
      accountId: withdrawal.account_id,
      assetId: withdrawal.asset_id,
      amount: withdrawal.amount,
      client,
    });

    if (!balance) {
      const error = new Error("Insufficient available balance");
      error.statusCode = 400;
      throw error;
    }

    await withdrawalRepository.updateWithdrawal({
      withdrawalId: withdrawal.id,
      status: "PROCESSING",
      client,
    });

    logger.info(
      {
        withdrawalId: withdrawal.id,
        accountId: withdrawal.account_id,
        assetId: withdrawal.asset_id,
        amount: withdrawal.amount,
      },
      "Withdrawal funds locked and processing started",
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  let transaction;

  try {
    transaction = await blockchainProvider.broadcastTransaction({
      assetId: withdrawal.asset_id,
      amount: withdrawal.amount,
      destination: withdrawal.destination,
    });

    if (!transaction) {
      const error = new Error("Blockchain transaction could not be broadcast");
      error.statusCode = 502;
      throw error;
    }
  } catch (error) {
    transaction = null;
  }

  if (!transaction) {
    const failureClient = await pool.connect();

    try {
      await failureClient.query("BEGIN");

      const currentWithdrawal =
        await withdrawalRepository.getWithdrawalForUpdate({
          withdrawalId: withdrawal.id,
          client: failureClient,
        });

      if (!currentWithdrawal) {
        const error = new Error("Withdrawal not found");
        error.statusCode = 404;
        throw error;
      }

      if (currentWithdrawal.status !== "PROCESSING") {
        const error = new Error(
          `Withdrawal cannot be failed from ${currentWithdrawal.status} status`,
        );
        error.statusCode = 400;
        throw error;
      }

      const unlockedBalance = await balanceRepository.unlockBalance({
        accountId: currentWithdrawal.account_id,
        assetId: currentWithdrawal.asset_id,
        amount: currentWithdrawal.amount,
        client: failureClient,
      });

      if (!unlockedBalance) {
        const error = new Error("Unable to unlock the balance");
        error.statusCode = 500;
        throw error;
      }
      const failedWithdrawal = await withdrawalRepository.updateWithdrawal({
        withdrawalId: currentWithdrawal.id,
        status: "FAILED",
        client: failureClient,
      });

      logger.warn(
        {
          withdrawalId: currentWithdrawal.id,
          accountId: currentWithdrawal.account_id,
          assetId: currentWithdrawal.asset_id,
          amount: currentWithdrawal.amount,
        },
        "Withdrawal failed and funds were unlocked",
      );

      await failureClient.query("COMMIT");

      return { withdrawal: failedWithdrawal, balance: unlockedBalance };
    } catch (error) {
      await failureClient.query("ROLLBACK");
      throw error;
    } finally {
      failureClient.release();
    }
  }

  const broadcastClient = await pool.connect();

  try {
    await broadcastClient.query("BEGIN");

    const currentWithdrawal = await withdrawalRepository.getWithdrawalForUpdate(
      { withdrawalId: withdrawal.id, client: broadcastClient },
    );

    if (!currentWithdrawal) {
      const error = new Error("Withdrawal not found");
      error.statusCode = 404;
      throw error;
    }

    if (currentWithdrawal.status !== "PROCESSING") {
      const error = new Error(
        `Withdrawal cannot be brodcast from ${currentWithdrawal.status} status`,
      );
      error.statusCode = 400;
      throw error;
    }

    const updatedWithdrawal = await withdrawalRepository.updateWithdrawal({
      withdrawalId: withdrawal.id,
      status: "BROADCAST",
      txHash: transaction.txHash,
      client: broadcastClient,
    });

    logger.info(
      {
        withdrawalId: updatedWithdrawal.id,
        accountId: updatedWithdrawal.account_id,
        assetId: updatedWithdrawal.asset_id,
        amount: updatedWithdrawal.amount,
        txHash: updatedWithdrawal.tx_hash,
      },
      "Withdrawal broadcast successfully",
    );

    await broadcastClient.query("COMMIT");

    return {
      withdrawal: updatedWithdrawal,
      balance,
    };
  } catch (error) {
    await broadcastClient.query("ROLLBACK");
    throw error;
  } finally {
    broadcastClient.release();
  }
};

const completeWithdrawal = async ({ accountId, withdrawalId }) => {
  const client = await pool.connect();

  let withdrawal;
  try {
    await client.query("BEGIN");

    withdrawal = await withdrawalRepository.getWithdrawalForUpdate({
      withdrawalId,
      client,
    });

    if (!withdrawal) {
      const error = new Error("Withdrawal not found");
      error.statusCode = 404;
      throw error;
    }

    if (withdrawal.account_id !== accountId) {
      const error = new Error("Withdrawal not found");
      error.statusCode = 404;
      throw error;
    }

    if (withdrawal.status !== "BROADCAST") {
      const error = new Error(
        `Withdrawal cannot be completed from ${withdrawal.status} status`,
      );
      error.statusCode = 400;
      throw error;
    }

    if (!withdrawal.tx_hash) {
      const error = new Error("Withdrawal transaction hash is missing");
      error.statusCode = 400;
      throw error;
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  let transaction;

  try {
    transaction = await blockchainProvider.getTransaction({
      txHash: withdrawal.tx_hash,
    });
  } catch (error) {
    logger.error(
      {
        err: error,
        withdrawalId,
        accountId,
      },
      "Failed to verify withdrawal transaction",
    );

    throw error;
  }

  if (!transaction) {
    const error = new Error("Blockchain transaction not found");
    error.statusCode = 502;
    throw error;
  }

  if (transaction.assetId !== withdrawal.asset_id) {
    const error = new Error("Blockchain transaction asset mismatch");
    error.statusCode = 400;
    throw error;
  }

  if (
    normalizeDecimal(transaction.amount) !== normalizeDecimal(withdrawal.amount)
  ) {
    const error = new Error("Blockchain transaction amount mismatch");
    error.statusCode = 400;
    throw error;
  }

  if (transaction.destination !== withdrawal.destination) {
    const error = new Error("Blockchain transaction destination mismatch");
    error.statusCode = 400;
    throw error;
  }

  if (transaction.confirmations < 3) {
    const error = new Error(
      "Withdrawal transaction has insufficient confirmations",
    );
    error.statusCode = 400;
    throw error;
  }

  const finalizeClient = await pool.connect();

  try {
    await finalizeClient.query("BEGIN");

    const currentWithdrawal = await withdrawalRepository.getWithdrawalForUpdate(
      {
        withdrawalId,
        client: finalizeClient,
      },
    );

    if (!currentWithdrawal) {
      const error = new Error("Withdrawal not found");
      error.statusCode = 404;
      throw error;
    }

    if (currentWithdrawal.account_id !== accountId) {
      const error = new Error("Withdrawal not found");
      error.statusCode = 404;
      throw error;
    }

    if (currentWithdrawal.status !== "BROADCAST") {
      const error = new Error(
        `Withdrawal cannot be completed from ${currentWithdrawal.status} status`,
      );
      error.statusCode = 400;
      throw error;
    }

    const balance = await balanceRepository.finalizeWithdrawalBalance({
      accountId: currentWithdrawal.account_id,
      assetId: currentWithdrawal.asset_id,
      amount: currentWithdrawal.amount,
      client: finalizeClient,
    });

    if (!balance) {
      const error = new Error("Insufficient locked balance");
      error.statusCode = 400;
      throw error;
    }

    const updatedWithdrawal = await withdrawalRepository.updateWithdrawal({
      withdrawalId: currentWithdrawal.id,
      status: "COMPLETED",
      txHash: currentWithdrawal.tx_hash,
      client: finalizeClient,
    });

    await finalizeClient.query("COMMIT");

    logger.info(
      {
        withdrawalId,
        accountId,
      },
      "Withdrawal completed",
    );

    return {
      withdrawal: updatedWithdrawal,
      balance,
    };
  } catch (error) {
    await finalizeClient.query("ROLLBACK");

    logger.error(
      { err: error, withdrawalId, accountId },
      "Failed to complete withdrawal",
    );
    
    throw error;
  } finally {
    finalizeClient.release();
  }
};

module.exports = { createWithdrawal, processWithdrawal, completeWithdrawal };

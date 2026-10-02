const assetRepository = require("../repositories/asset.repository");
const balanceRepository = require("../repositories/balance.repository");
const {
  isValidPositiveDecimal,
  getDecimalPlaces,
} = require("../utils/decimal");
const logger = require("../utils/logger");

const getBalanceByAccountId = async (accountId) => {
  return balanceRepository.getBalancesByAccountId(accountId);
};

const creditBalance = async ({ accountId, assetId, amount }) => {
  if (!isValidPositiveDecimal(amount)) {
    const error = new Error("Amount must be a positive decimal");
    error.statusCode = 400;
    throw error;
  }

  const assetResult = await assetRepository.getAssetById({ assetId });

  if (!assetResult) {
    const error = new Error("asset doesn't exist");
    error.statusCode = 404;
    throw error;
  }

  const asset = assetResult;

  const amountDecimalPlaces = getDecimalPlaces(amount);

  if (amountDecimalPlaces > asset.decimals) {
    const error = new Error("Amount exceeds asset decimal precision");
    error.statusCode = 400;
    throw error;
  }

  const balance = balanceRepository.creditBalance({
    accountId,
    assetId,
    amount,
  });

  logger.info(
    {
      accountId,
      assetId,
      amount,
      availableBalance: balance.available_balance,
      lockedBalance: balance.locked_balance,
    },
    "Balance credited",
  );

  return balance;
};

const debitBalance = async ({ accountId, assetId, amount }) => {
  if (!isValidPositiveDecimal(amount)) {
    const error = new Error("Amount must be a positive decimal");
    error.statusCode = 400;
    throw error;
  }

  const assetResult = await assetRepository.getAssetById({ assetId });

  if (!assetResult) {
    const error = new Error("asset doesn't exist");
    error.statusCode = 404;
    throw error;
  }

  const amountDecimalPlaces = getDecimalPlaces(amount);

  if (amountDecimalPlaces > assetResult.decimals) {
    const error = new Error("Amount exceeds asset decimal precision");
    error.statusCode = 400;
    throw error;
  }

  const debit = await balanceRepository.debitBalance({
    accountId,
    assetId,
    amount,
  });

  if (!debit) {
    const error = new Error("Insufficient available balance");
    error.statusCode = 400;
    throw error;
  }

  logger.info(
    {
      accountId,
      assetId,
      amount,
      availableBalance: debit.available_balance,
      lockedBalance: debit.locked_balance,
    },
    "Balance debited",
  );

  return debit;
};

const lockBalance = async ({ accountId, assetId, amount }) => {
  if (!isValidPositiveDecimal(amount)) {
    const error = new Error("Amount must be a positive decimal");
    error.statusCode = 400;
    throw error;
  }

  const assetResult = await assetRepository.getAssetById({ assetId });

  if (!assetResult) {
    const error = new Error("asset doesn't exist");
    error.statusCode = 404;
    throw error;
  }

  const amountDecimalPlaces = getDecimalPlaces(amount);

  if (amountDecimalPlaces > assetResult.decimals) {
    const error = new Error("Amount exceeds asset decimal precision");
    error.statusCode = 400;
    throw error;
  }

  const lock = await balanceRepository.lockBalance({
    accountId,
    assetId,
    amount,
  });

  if (!lock) {
    const error = new Error("Insufficient available balance");
    error.statusCode = 400;
    throw error;
  }

  logger.info(
    {
      accountId,
      assetId,
      amount,
      availableBalance: lock.available_balance,
      lockedBalance: lock.locked_balance,
    },
    "Balance locked",
  );

  return lock;
};

const unlockBalance = async ({ accountId, assetId, amount }) => {
  if (!isValidPositiveDecimal(amount)) {
    const error = new Error("Amount must be a positive decimal");
    error.statusCode = 400;
    throw error;
  }

  const assetResult = await assetRepository.getAssetById({ assetId });

  if (!assetResult) {
    const error = new Error("asset doesn't exist");
    error.statusCode = 404;
    throw error;
  }

  const amountDecimalPlaces = getDecimalPlaces(amount);

  if (amountDecimalPlaces > assetResult.decimals) {
    const error = new Error("Amount exceeds asset decimal precision");
    error.statusCode = 400;
    throw error;
  }

  const unlock = await balanceRepository.unlockBalance({
    accountId,
    assetId,
    amount,
  });

  if (!unlock) {
    const error = new Error("Insufficient locked balance");
    error.statusCode = 400;
    throw error;
  }

  logger.info(
    {
      accountId,
      assetId,
      amount,
      availableBalance: unlock.available_balance,
      lockedBalance: unlock.locked_balance,
    },
    "Balance unlocked",
  );

  return unlock;
};

module.exports = {
  getBalanceByAccountId,
  creditBalance,
  debitBalance,
  lockBalance,
  unlockBalance,
};

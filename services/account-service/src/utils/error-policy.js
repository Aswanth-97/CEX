const RETRYABLE_ERROR_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EPIPE",
]);

const RETRYABLE_PG_CODES = new Set([
  "08000",
  "08003",
  "08006",
  "08001",
  "08004",
  "57P01",
]);

const isRetryableError = (error) => {
  if (!error) {
    return false;
  }

  if (RETRYABLE_ERROR_CODES.has(error.code)) {
    return true;
  }

  if (RETRYABLE_PG_CODES.has(error.code)) {
    return true;
  }

  return false;
};

module.exports = {
  isRetryableError,
};

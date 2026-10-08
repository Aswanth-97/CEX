const RETRY_DELAYS_MS = [100, 500, 1000];

const MAX_RETRY_ATTEMPTS = 3;

const getRetryDelay = (attempt) => {
  return RETRY_DELAYS_MS[attempt - 1] ?? null;
};

module.exports = {
  RETRY_DELAYS_MS,
  MAX_RETRY_ATTEMPTS,
  getRetryDelay,
};

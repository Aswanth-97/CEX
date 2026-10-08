const { MAX_RETRY_ATTEMPTS, getRetryDelay } = require("../config/retryPolicy");
const { isRetryableError } = require("./error-policy");

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const withRetry = async (operation) => {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      const retryable = isRetryableError(error);
      if (!retryable) {
        error.retryCount = attempt;
        throw error;
      }

      if (attempt >= MAX_RETRY_ATTEMPTS) {
        error.retryCount = attempt;
        throw error;
      }

      attempt += 1;

      const delay = getRetryDelay(attempt);

      if (delay !== null) {
        await sleep(delay);
      }
    }
  }
};

module.exports = {
  withRetry,
};

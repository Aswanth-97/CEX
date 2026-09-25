const axios = require("axios");
const { ACCOUNT_SERVICE_URL } = require("../config/env");

const checkAccountsHealth = async (requestId) => {
  const response = await axios.get(`${ACCOUNT_SERVICE_URL}/health`, {
    headers: { "X-Request-ID": requestId },
  });

  return response;
};

const account_test1 = async (auth, requestId) => {
  const response = await axios.get(`${ACCOUNT_SERVICE_URL}/api/accounts/test`, {
    headers: { Authorization: auth, "X-Request-ID": requestId },
  });
  return response;
};

module.exports = { checkAccountsHealth, account_test1 };

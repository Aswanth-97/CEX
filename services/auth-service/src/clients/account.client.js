const { json } = require("express");
const { INTERNAL_SERVICE_KEY, ACCOUNT_SERVICE_URL } = require("../config/env");
const { post } = require("../routes/auth.routes");

const createAccount = async ({ userId, userName }) => {
  const response = await fetch(`${ACCOUNT_SERVICE_URL}/internal/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-service-key": INTERNAL_SERVICE_KEY,
    },
    body: JSON.stringify({ userId, userName }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Failed to create account");
    error.statusCode = response.status;
    throw error;
  }
  return data;
};

module.exports = createAccount;

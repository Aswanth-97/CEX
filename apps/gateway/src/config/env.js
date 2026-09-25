const dotenv = require("dotenv");

dotenv.config();

const requiredEnv = ["AUTH_SERVICE_URL", "ACCOUNT_SERVICE_URL"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const PORT = Number(process.env.PORT || 4000);

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

const ACCOUNT_SERVICE_URL = process.env.ACCOUNT_SERVICE_URL;

const NODE_ENV = process.env.NODE_ENV || "development";

const LOG_LEVEL = process.env.LOG_LEVEL || "info";

module.exports = {
  PORT,
  AUTH_SERVICE_URL,
  NODE_ENV,
  LOG_LEVEL,
  ACCOUNT_SERVICE_URL,
};

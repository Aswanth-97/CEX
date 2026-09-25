const dotenv = require("dotenv");

dotenv.config();

const requiredEnv = [
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "ACCESS_TOKEN_EXP",
  "REFRESH_TOKEN_SECRET",
  "REFRESH_TOKEN_EXP",
  "INTERNAL_SERVICE_KEY",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const PORT = Number(process.env.PORT || 4001);
const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT);
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

const DB_POOL_MAX = Number(process.env.DB_POOL_MAX);
const DB_POOL_MIN = Number(process.env.DB_POOL_MIN);
const DB_IDLE_TIMEOUT = Number(process.env.DB_IDLE_TIMEOUT);
const DB_CONNECTION_TIMEOUT = Number(process.env.DB_CONNECTION_TIMEOUT);
const DB_STATEMENT_TIMEOUT = Number(process.env.DB_STATEMENT_TIMEOUT);
const DB_QUERY_TIMEOUT = Number(process.env.DB_QUERY_TIMEOUT);

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const REFRESH_TOKEN_EXP = process.env.REFRESH_TOKEN_EXP;

const NODE_ENV = process.env.NODE_ENV || "development";

const LOG_LEVEL = process.env.LOG_LEVEL || "info";

const ACCESS_TOKEN_EXP = process.env.ACCESS_TOKEN_EXP;

const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;

const ACCOUNT_SERVICE_URL =
  process.env.ACCOUNT_SERVICE_URL || "http://localhost:4002";

module.exports = {
  PORT,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXP,
  ACCESS_TOKEN_EXP,
  DB_POOL_MAX,
  DB_POOL_MIN,
  DB_IDLE_TIMEOUT,
  DB_CONNECTION_TIMEOUT,
  DB_STATEMENT_TIMEOUT,
  DB_QUERY_TIMEOUT,
  NODE_ENV,
  LOG_LEVEL,
  INTERNAL_SERVICE_KEY,
  ACCOUNT_SERVICE_URL,
};

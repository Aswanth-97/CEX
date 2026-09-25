const dotenv = require("dotenv");

dotenv.config();

const requiredEnv = [
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "AUTH_SERVICE_URL",
  "KAFKA_BROKERS",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const PORT = process.env.PORT || 4002;
const KAFKA_BROKERS = process.env.KAFKA_BROKERS.split(",").map((broker) =>
  broker.trim(),
);
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;
const NODE_ENV = process.env.NODE_ENV || "development";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";

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

const KAFKA_MAX_RETRIES = Number(process.env.KAFKA_MAX_RETRIES || 3);
const KAFKA_RETRY_INITIAL_DELAY_MS = Number(
  process.env.KAFKA_RETRY_INITIAL_DELAY_MS || 1000,
);

module.exports = {
  PORT,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
  DB_POOL_MAX,
  DB_POOL_MIN,
  DB_IDLE_TIMEOUT,
  DB_CONNECTION_TIMEOUT,
  DB_STATEMENT_TIMEOUT,
  DB_QUERY_TIMEOUT,
  NODE_ENV,
  LOG_LEVEL,
  AUTH_SERVICE_URL,
  INTERNAL_SERVICE_KEY,
  KAFKA_BROKERS,
  KAFKA_MAX_RETRIES,
  KAFKA_RETRY_INITIAL_DELAY_MS,
};

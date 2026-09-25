const { Pool } = require("pg");
const {
  DB_HOST,
  DB_NAME,
  DB_PORT,
  DB_PASSWORD,
  DB_USER,
  DB_IDLE_TIMEOUT,
  DB_CONNECTION_TIMEOUT,
  DB_STATEMENT_TIMEOUT,
  DB_QUERY_TIMEOUT,
  DB_POOL_MAX,
  DB_POOL_MIN,
} = require("./env");

const pool = new Pool({
  host: DB_HOST,
  database: DB_NAME,
  port: DB_PORT,
  password: DB_PASSWORD,
  user: DB_USER,

  max: DB_POOL_MAX,
  min: DB_POOL_MIN,

  idleTimeoutMillis: DB_IDLE_TIMEOUT,
  connectionTimeoutMillis: DB_CONNECTION_TIMEOUT,

  statement_timeout: DB_STATEMENT_TIMEOUT,
  query_timeout: DB_QUERY_TIMEOUT,
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected PostgreSQL pool error");
});

module.exports = pool;

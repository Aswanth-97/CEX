const { Pool } = require("pg");
const { DB_HOST, DB_NAME, DB_PORT, DB_PASSWORD, DB_USER } = require("./env");

const pool = new Pool({
  host: DB_HOST,
  database: DB_NAME,
  port: DB_PORT,
  password: DB_PASSWORD,
  user: DB_USER,
});

module.exports = pool;

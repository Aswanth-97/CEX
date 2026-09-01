const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 4001;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCES_TOKEN_EXP,
  REFRESH_TOKEN_EXP,
} = process.env;

module.exports = {
  PORT,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCES_TOKEN_EXP,
  REFRESH_TOKEN_EXP,
};

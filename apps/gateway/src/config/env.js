const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 4000;

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:4001";

module.exports = { PORT, AUTH_SERVICE_URL };

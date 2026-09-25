const express = require("express");
const { PORT } = require("../src/config/env");
const authRoutes = require("./routes/auth.routes");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");
const PinoHttp = require("pino-http");
const pool = require("./config/db");

const app = express();
app.use(PinoHttp({ logger }));

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use(errorHandler);

pool
  .query("SELECT NOW()")
  .then((result) => {
    logger.info(`PostgreSQL connected: ${result.rows[0].now}`);

    app.listen(PORT, () => {
      logger.info(`auth-service running on ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error({ err }, "PostgreSQL connection failed");
    process.exit(1);
  });

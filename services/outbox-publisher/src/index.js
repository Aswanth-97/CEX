const express = require("express");
const { PORT, NODE_ENV, LOG_LEVEL } = require("./config/env");
// const logger = require("./utils/logger");
// const errorHandler = require("./middleware/errorHandler");
// const PinoHttp = require("pino-http");
const pool = require("./config/db");
const {
  getPendingEvents,
  processOutbox,
} = require("./services/outbox.service");
const logger = require("./utils/logger");
const producer = require("./config/kafka");

const app = express();
// app.use(PinoHttp({ logger }));

app.use(express.json());

const POLL_INTERVAL = 5000;

const start = async () => {
  try {
    const result = await pool.query("SELECT NOW() AS now");

    await producer.connect()

    logger.info(
      {
        DatabaseTime: result.rows[0].now,
        Environment: NODE_ENV,
        LogLevel: LOG_LEVEL,
      },
      "Outbox publisher PostgreSQL connection successful",
    );

    await processOutbox();

    setInterval(processOutbox, POLL_INTERVAL);

    // Keep the publisher process alive for now.
  } catch (error) {
    logger.error({ err: error }, "Outbox publisher startup failed");

    process.exit(1);
  }
};

start();

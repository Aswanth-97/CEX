const pool = require("./config/db");
const { PORT } = require("./config/env");
const { connectConsumer, runConsumer } = require("./services/consumer.service");
const logger = require("./utils/logger");
const app = require("./server");

const start = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    logger.info({ databaseTime: result.rows[0].now }, "PostgreSQL connected");

    await connectConsumer();

    runConsumer().catch((err) => {
      logger.error({ err }, "Kafka consumer stopped unexpectedly");
      process.exit(1);
    });

    app.listen(PORT, () => {
      logger.info(`account-service running on ${PORT}`);
    });
  } catch (err) {
    logger.error({ err }, "Account service startup failed");
    process.exit(1);
  }
};

module.exports = { start };

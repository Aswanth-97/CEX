const express = require("express");
const { PORT } = require("./config/env");
const authRoutes = require("./routes/auth.route");
const accountsRoutes = require("./routes/account.route");
const logger = require("./utils/logger");
const pinoHttp = require("pino-http");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const serverHealth = require("../src/routes/serverHealth");
const crypto = require("crypto");

const app = express();
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => {
      return req.headers["x-request-id"] || crypto.randomUUID();
    },
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/health", serverHealth);
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API-Gateway running on Port-${PORT}`);
});

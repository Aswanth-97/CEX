const express = require("express");
const logger = require("./utils/logger");
const pinoHttp = require("pino-http");
const errorHandler = require("./middleware/errorHandler");
const accountRoute = require("./routes/account.Routes");
const assetRoute = require("./routes/asset.Routes");
const balanceRoutes = require("./routes/balance.Routes");
const crypto = require("crypto");

const app = express();

app.use(express.json());
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => {
      return req.headers["x-request-id"] || crypto.randomUUID();
    },
  }),
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "account-service",
    message: "Account service is healthy",
  });
});

app.use("/internal/accounts", accountRoute);
app.use("/api/assets", assetRoute);
app.use("/api/accounts", balanceRoutes);

app.use(errorHandler);

module.exports = app;

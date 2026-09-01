const express = require("express");
const { PORT } = require("./config/env");
const authRoutes = require("./routes/auth.route");
const logger = require("./utils/logger");
const pinoHttp = require("pino-http");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");

const app = express();
app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({ service: "api-gateway", status: "ok" });
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API-Gateway running on Port-${PORT}`);
});

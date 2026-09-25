const pino = require("pino");
const { LOG_LEVEL, NODE_ENV } = require("../config/env");

const isProduction = NODE_ENV === "production";

const logger = pino({
  level: LOG_LEVEL,
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }),
});

module.exports = logger;

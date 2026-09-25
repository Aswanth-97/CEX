const pino = require("pino");

const { NODE_ENV, LOG_LEVEL } = require("../config/env");

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
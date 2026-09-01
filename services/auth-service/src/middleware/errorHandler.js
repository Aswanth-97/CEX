const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error(
    {
      err: {
        name: err.name,
        code: err.code,
        message: err.message,
        stack: err.stack,
      },
      url: req.originalUrl,
      method: req.method,
    },
    err.message || "Request Failed",
  );

  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal Server Error" : err.message,
    success: false,
  });
};

module.exports = errorHandler;

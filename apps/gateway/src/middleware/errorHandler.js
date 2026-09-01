const logger = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
  const statusCode = err.response?.status || err.statusCode || 500;

  const message =
    err.response?.data?.message || err.message || "Internal Server Error";

  logger.error(
    {
      err: {
        name: err.name,
        code: err.code,
        message: err.message,
        stack: err.stack,
      },

      statusCode,
      URL: req.originalUrl,
      method: req.method,
    },
    err.message || "Request Failed",
  );

  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal Server Error" : message,
    success: false,
  });
};

module.exports = errorHandler;

const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (err.code === "23505" ? 409 : 500);

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
      requestId: req.id,
    },
    err.message || "Request Failed",
  );

  let message = err.message;

  if (err.code === "23505") {
    message = "Resource already exists";
  }

  if (statusCode === 500) {
    message = "Internal Server Error";
  }

  res.status(statusCode).json({
    message,
    success: false,
  });
};

module.exports = errorHandler;

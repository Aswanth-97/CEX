const { INTERNAL_SERVICE_KEY } = require("../config/env");

const varifyInternalService = async (req, res, next) => {
  const serviceKey = req.headers["x-internal-service-key"];

  if (!serviceKey || serviceKey !== INTERNAL_SERVICE_KEY) {
    const error = new Error("Unauthorized Service");
    error.statusCode = 401;
    return next(error);
  }
  next();
};

module.exports = varifyInternalService;

const Joi = require("joi");

const validate = (schema, property) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationError = new Error(
        error.details.map((detail) => detail.message).join(", "),
      );
      validationError.statusCode = 400;

      next(validationError);
    }

    req[property] = value;
    next();
  };
};

module.exports = { validate };

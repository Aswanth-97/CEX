const Joi = require("joi");

const getOrderBookSchema = Joi.object({
  marketId: Joi.string().uuid().required(),

  side: Joi.string().valid("BUY", "SELL").required(),

  limit: Joi.number().integer().min(1).max(100).default(50),
});

module.exports = {
  getOrderBookSchema,
};

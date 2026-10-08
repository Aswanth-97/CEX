const Joi = require("joi");

const getMarketByIdSchema = Joi.object({
  marketId: Joi.string().uuid().required(),
});

const getMarketBySymbolSchema = Joi.object({
  marketSymbol: Joi.string().trim().max(30).required(),
});

const createMarketSchema = Joi.object({
  symbol: Joi.string().trim().max(30).required(),

  baseAssetId: Joi.string().uuid().required(),

  quoteAssetId: Joi.string().uuid().required(),

  status: Joi.string()
    .valid("ACTIVE", "SUSPENDED", "DELISTED")
    .default("ACTIVE"),

  pricePrecision: Joi.number().integer().min(0).max(18).required(),

  quantityPrecision: Joi.number().integer().min(0).max(18).required(),

  minQuantity: Joi.number().greater(0).required(),

  minNotional: Joi.number().greater(0).required(),
});

module.exports = {
  getMarketByIdSchema,
  getMarketBySymbolSchema,
  createMarketSchema,
};

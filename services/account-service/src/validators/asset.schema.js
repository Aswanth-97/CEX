const joi = require("joi");

const getAssetByIdSchema = joi.object({
  assetId: joi.string().uuid().required(),
});

const createAssetSchema = joi.object({
  symbol: joi.string().trim().uppercase().max(20).required(),
  name: joi.string().trim().max(100).required(),
  assetType: joi.string().trim().uppercase().valid("CRYPTO", "FIAT").required(),
  decimals: joi.number().integer().min(0).max(18).required(),
  status: joi
    .string()
    .valid("ACTIVE", "SUSPENDED", "DELISTED")
    .default("ACTIVE"),
});

const updateAssetSchema = joi
  .object({
    name: joi.string().trim().max(100),
    status: joi.string().valid("ACTIVE", "SUSPENDED", "DELISTED"),
  })
  .min(1);

const getAssetSchema = joi.object({
  assetType: joi.string().trim().uppercase().valid("CRYPTO", "FIAT"),
  status: joi.string().valid("ACTIVE", "SUSPENDED", "DELISTED"),
});

module.exports = {
  getAssetByIdSchema,
  createAssetSchema,
  updateAssetSchema,
  getAssetSchema,
};

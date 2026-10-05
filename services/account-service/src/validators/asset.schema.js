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

const updateAssetNetworkSchema = joi
  .object({
    networkName: joi.string().trim().max(100),
    status: joi.string().valid("ACTIVE", "SUSPENDED", "DELISTED"),
  })
  .min(1);

const getAssetNetworkByIdSchema = joi.object({
  assetNetworkId: joi.string().uuid().required(),
});

const createAssetNetworkSchema = joi.object({
  network: joi.string().max(30).required(),
  networkName: joi.string().max(100).required(),
  assetId: joi.string().uuid().required(),
  status: joi
    .string()
    .valid("ACTIVE", "SUSPENDED", "DELISTED")
    .default("ACTIVE"),
});

module.exports = {
  getAssetByIdSchema,
  createAssetSchema,
  updateAssetSchema,
  getAssetSchema, 
  updateAssetNetworkSchema,
  getAssetNetworkByIdSchema,
  createAssetNetworkSchema,
};

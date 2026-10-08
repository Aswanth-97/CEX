const marketRepository = require("../repositories/market.repository");
const assetRepository = require("../repositories/asset.repository");

const getAllMarkets = async () => {
  return marketRepository.getAllMarkets();
};

const getMarketById = async ({ marketId }) => {
  return marketRepository.getMarketById({ marketId });
};

const getMarketBySymbol = async ({ symbol }) => {
  return marketRepository.getMarketBySymbol({ symbol });
};

const createMarket = async ({
  symbol,
  baseAssetId,
  quoteAssetId,
  status,
  pricePrecision,
  quantityPrecision,
  minQuantity,
  minNotional,
}) => {
  const baseAsset = await assetRepository.getAssetById({
    assetId: baseAssetId,
  });

  if (!baseAsset) {
    const error = new Error("Base asset not found");
    error.statusCode = 404;
    throw error;
  }

  const quoteAsset = await assetRepository.getAssetById({
    assetId: quoteAssetId,
  });

  if (!quoteAsset) {
    const error = new Error("Quote asset not found");
    error.statusCode = 404;
    throw error;
  }

  if (baseAssetId === quoteAssetId) {
    const error = new Error("Base asset and quote asset must be different");
    error.statusCode = 400;
    throw error;
  }

  if (
    status === "ACTIVE" &&
    (baseAsset.status !== "ACTIVE" || quoteAsset.status !== "ACTIVE")
  ) {
    const error = new Error(
      "Cannot create an ACTIVE market with inactive assets",
    );
    error.statusCode = 400;
    throw error;
  }

  if (quantityPrecision > baseAsset.decimals) {
    const error = new Error(
      "Quantity precision cannot exceed base asset decimals",
    );
    error.statusCode = 400;
    throw error;
  }

  return marketRepository.createMarket({
    symbol,
    baseAssetId,
    quoteAssetId,
    status,
    pricePrecision,
    quantityPrecision,
    minQuantity,
    minNotional,
  });
};

module.exports = {
  getAllMarkets,
  getMarketById,
  getMarketBySymbol,
  createMarket,
};

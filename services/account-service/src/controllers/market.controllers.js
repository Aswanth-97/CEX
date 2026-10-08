const marketService = require("../services/markets.service");

const getAllMarkets = async (req, res, next) => {
  try {
    const result = await marketService.getAllMarkets();

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getMarketById = async (req, res, next) => {
  const { marketId } = req.params;
  try {
    const result = await marketService.getMarketById({ marketId });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getMarketBySymbol = async (req, res, next) => {
  const { marketSymbol } = req.params;
  try {
    const result = await marketService.getMarketBySymbol({
      symbol: marketSymbol,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const createMarket = async (req, res, next) => {
  const {
    symbol,
    baseAssetId,
    quoteAssetId,
    status,
    pricePrecision,
    quantityPrecision,
    minQuantity,
    minNotional,
  } = req.body;
  try {
    const result = await marketService.createMarket({
      symbol,
      baseAssetId,
      quoteAssetId,
      status,
      pricePrecision,
      quantityPrecision,
      minQuantity,
      minNotional,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMarkets,
  getMarketById,
  getMarketBySymbol,
  createMarket,
};

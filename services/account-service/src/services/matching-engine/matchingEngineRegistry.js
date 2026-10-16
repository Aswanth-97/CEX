const matchingEngineInitializer = require("./initializeMatchingEngine");
const marketRepository = require("../../repositories/market.repository");
const logger = require("../../utils/logger");

const matchingEngine = new Map();

const initializeAll = async () => {
  try {
    const markets = await marketRepository.getAllMarkets();

    const activeMarkets = markets.filter(
      (market) => market.status === "ACTIVE",
    );

    const initializeEngine = new Map();

    for (const market of activeMarkets) {
      const engine = await matchingEngineInitializer.initializeMatchingEngine({
        marketId: market.id,
      });

      initializeEngine.set(market.id, engine);
    }

    matchingEngine.clear();

    for (const [marketId, engine] of initializeEngine) {
      matchingEngine.set(marketId, engine);
    }

    logger.info(
      { marketCount: activeMarkets.length },
      "Matching engines initialized successfully",
    );

    return matchingEngine;
  } catch (error) {
    logger.error({ err: error }, "Failed to initialize matching engines");

    throw error;
  }
};

const getMatchingEngine = ({ marketId }) => {
  if (!marketId) {
    throw new Error("marketId required");
  }

  const engine = matchingEngine.get(marketId);

  if (!engine) {
    throw new Error(`Matching engine not initialized for market ${marketId}`);
  }
  return engine;
};

module.exports = { initializeAll, getMatchingEngine };

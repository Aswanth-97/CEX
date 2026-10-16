const orderBookRepository = require("../../repositories/orderBook.repository");
const OrderBook = require("./OrderBook");
const MatchingEngine = require("./MatchingEngine");
const logger = require("../../utils/logger");

const initializeMatchingEngine = async ({ marketId }) => {
  if (!marketId) {
    throw new Error("Market ID is required");
  }
  logger.info({ marketId }, "Initializing matching engine");

  try {
    const orderBookInstance = new OrderBook(marketId);

    const activeOrders = await orderBookRepository.getAllActiveOrdersForMarket({
      marketId,
    });

    for (const row of activeOrders) {
      const order = {
        id: row.id,
        marketId: row.market_id,
        side: row.side,
        price: row.price,
        remainingQuantity: row.remaining_quantity,
        createdAt: row.created_at,
      };

      orderBookInstance.addOrder(order);
    }

    const matchingEngine = new MatchingEngine(orderBookInstance);

    logger.info(
      {
        marketId,
        activeOrderCount: activeOrders.length,
      },
      "Matching engine initialized successfully",
    );

    return matchingEngine;
  } catch (error) {
    logger.error(
      {
        err: error,
        marketId,
      },
      "Failed to initialize matching engine",
    );
    throw error;
  }
};

module.exports = { initializeMatchingEngine };

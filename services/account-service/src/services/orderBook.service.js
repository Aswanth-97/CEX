const orderBookRepository = require("../repositories/orderBook.repository");
const marketREpository = require("../repositories/market.repository");
const logger = require("../utils/logger");

const getOrderBookOrders = async ({
  marketId,
  side,
  limit = 50,
  requestId,
}) => {
  logger.info({ requestId, marketId, side, limit }, "Fetching order book");

  const market = await marketREpository.getMarketById({ marketId });

  if (!market) {
    const error = new Error("Market not found");
    error.statusCode = 404;
    throw error;
  }

  if (market.status !== "ACTIVE") {
    const error = new Error("Market not active");
    error.statusCode = 400;
    throw error;
  }

  if (!["BUY", "SELL"].includes(side)) {
    const error = new Error("Side should be BUY or SELL");
    error.statusCode = 400;
    throw error;
  }

  const activeOrders = await orderBookRepository.getOrderBookOrders({
    marketId,
    side,
    limit,
  });

  logger.info(
    { requestId, marketId, side, orderCount: activeOrders.length },
    "Order book fetched successfully",
  );

  return activeOrders;
};

module.exports = {
  getOrderBookOrders,
};

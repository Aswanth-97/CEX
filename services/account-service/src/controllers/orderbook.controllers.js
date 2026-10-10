const orderBookServices = require("../services/orderBook.service");

const getOrderBookOrders = async (req, res, next) => {
  const { marketId, side, limit } = req.query;
  try {
    const result = await orderBookServices.getOrderBookOrders({
      marketId,
      side,
      limit,
      requestId: req.id,
    });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrderBookOrders };

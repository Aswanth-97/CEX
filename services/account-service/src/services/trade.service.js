const orderRepository = require("../repositories/order.repository");
const tradeRepository = require("../repositories/trade.repository");
const pool = require("../config/db");
const logger = require("../utils/logger");
const Decimal = require("decimal.js");

const executeTrade = async ({ buyOrderId, sellOrderId, price, quantity }) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const orders = await orderRepository.getOrdersForUpdate({
      orderIds: [buyOrderId, sellOrderId],
      client,
    });

    if (orders.length !== 2) {
      const error = new Error("Both orders must exist");
      error.statusCode = 404;
      throw error;
    }

    const buyOrder = orders.find((order) => order.id === buyOrderId);

    const sellOrder = orders.find((order) => order.id === sellOrderId);

    if (!buyOrder || !sellOrder) {
      const error = new Error("BUY or SELL order not found");
      error.statusCode = 404;
      throw error;
    }

    if (buyOrder.side !== "BUY" || sellOrder.side !== "SELL") {
      const error = new Error("Expected one BUY order and one SELL order");
      error.statusCode = 400;
      throw error;
    }

    if (buyOrder.market_id !== sellOrder.market_id) {
      const error = new Error("Orders must belong to the same market");
      error.statusCode = 400;
      throw error;
    }

    if (
      !["NEW", "PARTIALLY_FILLED"].includes(buyOrder.status) ||
      !["NEW", "PARTIALLY_FILLED"].includes(sellOrder.status)
    ) {
      const error = new Error("Both orders must be active");
      error.statusCode = 409;
      throw error;
    }

    const executionPrice = new Decimal(price);
    const buyPrice = new Decimal(buyOrder.price);
    const sellPrice = new Decimal(sellOrder.price);

    if (
      !executionPrice.isFinite() ||
      !executionPrice.isPositive() ||
      executionPrice.greaterThan(buyPrice) ||
      executionPrice.lessThan(sellPrice)
    ) {
      const error = new Error(
        "Execution price is outside the permitted order prices",
      );
      error.statusCode = 400;
      throw error;
    }

    const executionQuantity = new Decimal(quantity);
    const buyRemaining = new Decimal(buyOrder.remaining_quantity);
    const sellRemaining = new Decimal(sellOrder.remaining_quantity);

    if (
      !executionQuantity.isFinite() ||
      !executionQuantity.isPositive() ||
      executionQuantity.greaterThan(buyRemaining) ||
      executionQuantity.greaterThan(sellRemaining)
    ) {
      const error = new Error(
        "Trade quantity exceeds an order's remaining quantity",
      );
      error.statusCode = 400;
      throw error;
    }

    const trade = await tradeRepository.createTradeWithClient({
      client,
      marketId: buyOrder.market_id,
      buyOrderId: buyOrder.id,
      sellOrderId: sellOrder.id,
      price: executionPrice.toString(),
      quantity: executionQuantity.toString(),
    });

    const updatedBuyOrder = await orderRepository.updateOrderFillWithClient({
      client,
      orderId: buyOrder.id,
      filledQuantity: executionQuantity.toString(),
    });

    const updatedSellOrder = await orderRepository.updateOrderFillWithClient({
      client,
      orderId: sellOrder.id,
      filledQuantity: executionQuantity.toString(),
    });

    if (!updatedBuyOrder || !updatedSellOrder) {
      throw new Error("Failed to update one or both order fills");
    }

    await client.query("COMMIT");
    transactionStarted = false;

    logger.info(
      {
        tradeId: trade.id,
        buyOrderId: buyOrder.id,
        sellOrderId: sellOrder.id,
        price: executionPrice.toString(),
        quantity: executionQuantity.toString(),
      },
      "Trade executed successfully",
    );

    return {
      trade,
      buyOrder: updatedBuyOrder,
      sellOrder: updatedSellOrder,
    };
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        logger.error(
          { err: rollbackError, buyOrderId, sellOrderId },
          "Trade transaction rollback failed",
        );
      }
    }

    logger.error(
      { err: error, buyOrderId, sellOrderId },
      "Trade execution failed",
    );

    throw error;
  } finally {
    client.release();
  }
};

module.exports = { executeTrade };

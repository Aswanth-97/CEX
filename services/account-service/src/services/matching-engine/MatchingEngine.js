const decimal = require("decimal.js");

class MatchingEngine {
  constructor(orderbook) {
    this.orderbook = orderbook;
  }

  canMatch(order) {
    if (order.side === "BUY") {
      const bestSell = this.orderbook.getBestSell();
      if (!bestSell) {
        return false;
      }
      return new decimal(order.price).greaterThanOrEqualTo(bestSell.price);
    }

    if (order.side === "SELL") {
      const bestBuy = this.orderbook.getBestBuy();
      if (!bestBuy) {
        return false;
      }
      return new decimal(order.price).lessThanOrEqualTo(bestBuy.price);
    }

    throw new Error("Invalid order side");
  }

  calculateFillQuantity(buyOrder, sellOrder) {
    const buyRemaining = new decimal(buyOrder.remainingQuantity);
    const sellRemaining = new decimal(sellOrder.remainingQuantity);

    if (
      buyRemaining.lessThanOrEqualTo(0) ||
      sellRemaining.lessThanOrEqualTo(0)
    ) {
      return new decimal(0);
    }
    return decimal.min(buyRemaining, sellRemaining);
  }

  applyFill(buyOrder, sellOrder) {
    const fillQuantity = this.calculateFillQuantity(buyOrder, sellOrder);

    if (fillQuantity.lessThanOrEqualTo(0)) {
      return new decimal(0);
    }

    buyOrder.remainingQuantity = new decimal(buyOrder.remainingQuantity).minus(
      fillQuantity,
    );
    sellOrder.remainingQuantity = new decimal(
      sellOrder.remainingQuantity,
    ).minus(fillQuantity);

    return fillQuantity;
  }

  removeFilledOrder(order) {
    if (new decimal(order.remainingQuantity).greaterThan(0)) {
      return;
    }
    this.orderbook.removeFirstOrder(order.side, order);
  }

  matchOrder(incomingOrder) {
    const fills = [];

    this.validateOrder(incomingOrder);

    while (
      new decimal(incomingOrder.remainingQuantity).greaterThan(0) &&
      this.canMatch(incomingOrder)
    ) {
      const isBuy = incomingOrder.side === "BUY";

      const bestLevel = isBuy
        ? this.orderbook.getBestSell()
        : this.orderbook.getBestBuy();

      const restingOrder = bestLevel.getFirstOrder();

      if (!restingOrder) {
        throw new Error("Best price level has no resting orders");
      }

      const buyOrder = isBuy ? incomingOrder : restingOrder;
      const sellOrder = isBuy ? restingOrder : incomingOrder;

      const fillQuantity = this.applyFill(buyOrder, sellOrder);

      if (fillQuantity.lessThanOrEqualTo(0)) {
        throw new Error("Matching produced a non-positive fill");
      }

      fills.push({
        buyOrderId: buyOrder.id,
        sellOrderId: sellOrder.id,
        price: restingOrder.price,
        quantity: fillQuantity.toString(),
      });

      this.removeFilledOrder(restingOrder);
    }

    if (new decimal(incomingOrder.remainingQuantity).greaterThan(0)) {
      this.orderbook.addOrder(incomingOrder);
    }

    return fills;
  }
  validateOrder(order) {
    if (!order) {
      throw new Error("Order is required");
    }

    if (order.marketId !== this.orderbook.marketId) {
      throw new Error("Order market does not match matching engine market");
    }

    const quantity = new decimal(order.remainingQuantity);

    if (!quantity.isFinite() || quantity.lessThanOrEqualTo(0)) {
      throw new Error("Order quantity must be greater than zero");
    }
  }
}
module.exports = MatchingEngine;

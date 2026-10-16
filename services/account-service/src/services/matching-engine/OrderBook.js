const binaryHeap = require("./BinaryHeap");
const PriceLevel = require("./PriceLevel");
const Decimal = require("decimal.js");

class orderBook {
  constructor(marketId) {
    if (!marketId) {
      throw new Error("Market ID is required");
    }

    this.marketId = marketId;
    this.buyHeap = new binaryHeap((a, b) => a.price - b.price);
    this.sellHeap = new binaryHeap((a, b) => b.price - a.price);
    this.buyLevels = new Map();
    this.sellLevels = new Map();
  }

  addOrder(order) {
    if (order.marketId !== this.marketId) {
      throw new Error("Order market does not match order book market");
    }

    if (order.side !== "BUY" && order.side !== "SELL") {
      throw new Error("Invalid order side");
    }

    const price = new Decimal(order.price);
    const remainingQuantity = new Decimal(order.remainingQuantity);

    if (!price.isFinite() || price.lte(0)) {
      throw new Error("Invalid order price");
    }

    if (!remainingQuantity.isFinite() || remainingQuantity.lte(0)) {
      throw new Error("Invalid remaining quantity");
    }

    const isBuy = order.side === "BUY";

    const levels = isBuy ? this.buyLevels : this.sellLevels;

    const heap = isBuy ? this.buyHeap : this.sellHeap;

    let level = levels.get(order.price);

    if (!level) {
      level = new PriceLevel(order.price);
      levels.set(order.price, level);
      heap.insert(level);
    }

    level.addOrder(order);
  }

  getBestBuy() {
    return this.buyHeap.max_heap();
  }
  getBestSell() {
    return this.sellHeap.max_heap();
  }

  removeFirstOrder(side, expectedOrder) {
    const isBuy = side === "BUY";

    if (!isBuy && side !== "SELL") {
      throw new Error("Invalid order side");
    }

    const levels = isBuy ? this.buyLevels : this.sellLevels;
    const heap = isBuy ? this.buyHeap : this.sellHeap;

    const level = heap.max_heap();

    if (!level) {
      return null;
    }

    const firstOrder = level.getFirstOrder();

    if (!firstOrder) {
      throw new Error("Best price level has no orders");
    }

    if (expectedOrder && firstOrder !== expectedOrder) {
      throw new Error("Order is not first in the best price level");
    }

    const removeOrder = level.removeFirstOrder();

    if (level.isEmpty()) {
      levels.delete(level.price);
      heap.deleteMax();
    }
    return removeOrder;
  }
}

module.exports = orderBook;

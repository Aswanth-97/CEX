const test = require("node:test");
const assert = require("node:assert/strict");
const OrderBook = require("./OrderBook");

test("OrderBook rejects an invalid order price", () => {
  const orderBook = new OrderBook("market-123");

  assert.throws(
    () =>
      orderBook.addOrder({
        id: "order-1",
        marketId: "market-123",
        side: "BUY",
        price: "0",
        remainingQuantity: "1",
      }),
    { message: "Invalid order price" },
  );
});

test("OrderBook rejects a negative order price", () => {
  const orderBook = new OrderBook("market-123");

  assert.throws(
    () =>
      orderBook.addOrder({
        id: "order-1",
        marketId: "market-123",
        side: "BUY",
        price: "-10",
        remainingQuantity: "1",
      }),
    { message: "Invalid order price" },
  );
});

test("OrderBook rejects zero remaining quantity", () => {
  const orderBook = new OrderBook("market-123");

  assert.throws(
    () =>
      orderBook.addOrder({
        id: "order-1",
        marketId: "market-123",
        side: "SELL",
        price: "100",
        remainingQuantity: "0",
      }),
    { message: "Invalid remaining quantity" },
  );
});

test("OrderBook rejects negative remaining quantity", () => {
  const orderBook = new OrderBook("market-123");

  assert.throws(
    () =>
      orderBook.addOrder({
        id: "order-1",
        marketId: "market-123",
        side: "SELL",
        price: "100",
        remainingQuantity: "-0.5",
      }),
    { message: "Invalid remaining quantity" },
  );
});

test("OrderBook rejects a non-finite order price", () => {
  const orderBook = new OrderBook("market-123");

  assert.throws(
    () =>
      orderBook.addOrder({
        id: "order-1",
        marketId: "market-123",
        side: "BUY",
        price: "Infinity",
        remainingQuantity: "1",
      }),
    { message: "Invalid order price" },
  );
});

test("OrderBook rejects a non-finite order price", () => {
  const orderBook = new OrderBook("market-123");

  assert.throws(
    () =>
      orderBook.addOrder({
        id: "order-1",
        marketId: "market-123",
        side: "BUY",
        price: "Infinity",
        remainingQuantity: "1",
      }),
    { message: "Invalid order price" },
  );
});

test("OrderBook rejects a non-finite remaining quantity", () => {
  const orderBook = new OrderBook("market-123");

  assert.throws(
    () =>
      orderBook.addOrder({
        id: "order-1",
        marketId: "market-123",
        side: "SELL",
        price: "100",
        remainingQuantity: "Infinity",
      }),
    { message: "Invalid remaining quantity" },
  );
});

test("OrderBook does not change when rejecting an invalid order", () => {
  const orderBook = new OrderBook("market-123");

  assert.throws(
    () =>
      orderBook.addOrder({
        id: "order-invalid",
        marketId: "market-123",
        side: "BUY",
        price: "0",
        remainingQuantity: "1",
      }),
    { message: "Invalid order price" },
  );

  assert.equal(orderBook.buyLevels.size, 0);
  assert.equal(orderBook.sellLevels.size, 0);
  assert.equal(orderBook.buyHeap.size(), 0);
  assert.equal(orderBook.sellHeap.size(), 0);
});

test("OrderBook adds a valid BUY order", () => {
  const orderBook = new OrderBook("market-123");

  const order = {
    id: "order-1",
    marketId: "market-123",
    side: "BUY",
    price: "100",
    remainingQuantity: "1",
  };

  orderBook.addOrder(order);

  const bestBuy = orderBook.getBestBuy();

  assert.ok(bestBuy);
  assert.equal(bestBuy.price, "100");
  assert.equal(bestBuy.getFirstOrder(), order);
  assert.equal(orderBook.buyLevels.size, 1);
  assert.equal(orderBook.sellLevels.size, 0);
});

test("OrderBook adds a valid SELL order", () => {
  const orderBook = new OrderBook("market-123");

  const order = {
    id: "order-2",
    marketId: "market-123",
    side: "SELL",
    price: "110",
    remainingQuantity: "0.5",
  };

  orderBook.addOrder(order);

  const bestSell = orderBook.getBestSell();

  assert.ok(bestSell);
  assert.equal(bestSell.price, "110");
  assert.equal(bestSell.getFirstOrder(), order);
  assert.equal(orderBook.sellLevels.size, 1);
  assert.equal(orderBook.buyLevels.size, 0);
});

test("OrderBook returns the highest BUY price", () => {
  const orderBook = new OrderBook("market-123");

  orderBook.addOrder({
    id: "buy-1",
    marketId: "market-123",
    side: "BUY",
    price: "100",
    remainingQuantity: "1",
  });

  orderBook.addOrder({
    id: "buy-2",
    marketId: "market-123",
    side: "BUY",
    price: "105",
    remainingQuantity: "1",
  });

  orderBook.addOrder({
    id: "buy-3",
    marketId: "market-123",
    side: "BUY",
    price: "102",
    remainingQuantity: "1",
  });

  assert.equal(orderBook.getBestBuy().price, "105");
});

test("OrderBook returns the lowest SELL price", () => {
  const orderBook = new OrderBook("market-123");

  orderBook.addOrder({
    id: "sell-1",
    marketId: "market-123",
    side: "SELL",
    price: "110",
    remainingQuantity: "1",
  });

  orderBook.addOrder({
    id: "sell-2",
    marketId: "market-123",
    side: "SELL",
    price: "105",
    remainingQuantity: "1",
  });

  orderBook.addOrder({
    id: "sell-3",
    marketId: "market-123",
    side: "SELL",
    price: "108",
    remainingQuantity: "1",
  });

  assert.equal(orderBook.getBestSell().price, "105");
});

test("OrderBook preserves FIFO for BUY orders at the same price", () => {
  const orderBook = new OrderBook("market-123");

  const firstOrder = {
    id: "buy-first",
    marketId: "market-123",
    side: "BUY",
    price: "100",
    remainingQuantity: "1",
  };

  const secondOrder = {
    id: "buy-second",
    marketId: "market-123",
    side: "BUY",
    price: "100",
    remainingQuantity: "2",
  };

  orderBook.addOrder(firstOrder);
  orderBook.addOrder(secondOrder);

  const bestBuy = orderBook.getBestBuy();

  assert.equal(bestBuy.getFirstOrder(), firstOrder);
});

test("OrderBook removes the first BUY order and preserves the next order", () => {
  const orderBook = new OrderBook("market-123");

  const firstOrder = {
    id: "buy-first",
    marketId: "market-123",
    side: "BUY",
    price: "100",
    remainingQuantity: "1",
  };

  const secondOrder = {
    id: "buy-second",
    marketId: "market-123",
    side: "BUY",
    price: "100",
    remainingQuantity: "2",
  };

  orderBook.addOrder(firstOrder);
  orderBook.addOrder(secondOrder);

  const removedOrder = orderBook.removeFirstOrder("BUY", firstOrder);

  assert.equal(removedOrder, firstOrder);
  assert.equal(orderBook.getBestBuy().getFirstOrder(), secondOrder);
  assert.equal(orderBook.buyLevels.size, 1);
});

test("OrderBook removes an empty BUY price level", () => {
  const orderBook = new OrderBook("market-123");

  const order = {
    id: "buy-only",
    marketId: "market-123",
    side: "BUY",
    price: "100",
    remainingQuantity: "1",
  };

  orderBook.addOrder(order);

  const removedOrder = orderBook.removeFirstOrder("BUY", order);

  assert.equal(removedOrder, order);
  assert.equal(orderBook.buyLevels.size, 0);
  assert.equal(orderBook.buyHeap.size(), 0);
});
test("OrderBook rejects an invalid removal side", () => {
  const orderBook = new OrderBook("market-123");

  assert.throws(() => orderBook.removeFirstOrder("HOLD"), {
    message: "Invalid order side",
  });
});

test("OrderBook rejects removing an order that is not first", () => {
  const orderBook = new OrderBook("market-123");

  const firstOrder = {
    id: "buy-first",
    marketId: "market-123",
    side: "BUY",
    price: "100",
    remainingQuantity: "1",
  };

  const secondOrder = {
    id: "buy-second",
    marketId: "market-123",
    side: "BUY",
    price: "100",
    remainingQuantity: "2",
  };

  orderBook.addOrder(firstOrder);
  orderBook.addOrder(secondOrder);

  assert.throws(() => orderBook.removeFirstOrder("BUY", secondOrder), {
    message: "Order is not first in the best price level",
  });

  assert.equal(orderBook.getBestBuy().getFirstOrder(), firstOrder);
  assert.equal(orderBook.buyLevels.size, 1);
});
test("OrderBook removes an empty SELL price level", () => {
  const orderBook = new OrderBook("market-123");

  const order = {
    id: "sell-only",
    marketId: "market-123",
    side: "SELL",
    price: "110",
    remainingQuantity: "1",
  };

  orderBook.addOrder(order);

  const removedOrder = orderBook.removeFirstOrder("SELL", order);

  assert.equal(removedOrder, order);
  assert.equal(orderBook.sellLevels.size, 0);
  assert.equal(orderBook.sellHeap.size(), 0);
});

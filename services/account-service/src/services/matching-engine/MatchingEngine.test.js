const test = require("node:test");
const assert = require("node:assert/strict");
const Decimal = require("decimal.js");
const DEFAULT_MARKET_ID = "market-btc-usdt";

const OrderBook = require("./OrderBook");
const MatchingEngine = require("./MatchingEngine");

function createOrderBook(marketId = DEFAULT_MARKET_ID) {
  const book = new OrderBook(marketId);
  const engine = new MatchingEngine(book);

  return { book, engine };
}

function makeOrder(id, side, price, quantity, marketId = DEFAULT_MARKET_ID) {
  return {
    id,
    side,
    price,
    marketId,
    remainingQuantity: new Decimal(quantity),
  };
}

test("partial fill keeps the resting order in the book", () => {
  const { book, engine } = createOrderBook();

  const sell = makeOrder("sell-1", "SELL", 59000, "1");
  const buy = makeOrder("buy-1", "BUY", 60000, "0.4");

  book.addOrder(sell);

  const fills = engine.matchOrder(buy);

  assert.equal(fills.length, 1);
  assert.equal(fills[0].quantity, "0.4");
  assert.equal(buy.remainingQuantity.toString(), "0");
  assert.equal(sell.remainingQuantity.toString(), "0.6");
  assert.equal(book.getBestSell()?.price, 59000);
  assert.equal(book.getBestSell().size(), 1);
});

test("full fill removes the resting order and empty price level", () => {
  const { book, engine } = createOrderBook();

  const sell = makeOrder("sell-1", "SELL", 59000, "1");
  const buy = makeOrder("buy-1", "BUY", 60000, "1");

  book.addOrder(sell);

  const fills = engine.matchOrder(buy);

  assert.equal(fills.length, 1);
  assert.equal(fills[0].quantity, "1");
  assert.equal(book.getBestSell(), null);
  assert.equal(book.sellLevels.has(59000), false);
});

test("matches multiple orders in price-time priority", () => {
  const { book, engine } = createOrderBook();

  const sell1 = makeOrder("sell-1", "SELL", 59000, "0.3");
  const sell2 = makeOrder("sell-2", "SELL", 59000, "0.4");
  const sell3 = makeOrder("sell-3", "SELL", 60000, "0.5");
  const buy = makeOrder("buy-1", "BUY", 61000, "0.8");

  book.addOrder(sell1);
  book.addOrder(sell2);
  book.addOrder(sell3);

  const fills = engine.matchOrder(buy);

  assert.deepEqual(
    fills.map((fill) => [fill.sellOrderId, fill.quantity]),
    [
      ["sell-1", "0.3"],
      ["sell-2", "0.4"],
      ["sell-3", "0.1"],
    ],
  );

  assert.equal(buy.remainingQuantity.toString(), "0");
  assert.equal(sell3.remainingQuantity.toString(), "0.4");
  assert.equal(book.getBestSell()?.price, 60000);
});

test("adds incoming order remainder to the book", () => {
  const { book, engine } = createOrderBook();

  const sell = makeOrder("sell-1", "SELL", 59000, "0.4");
  const buy = makeOrder("buy-1", "BUY", 60000, "1");

  book.addOrder(sell);

  const fills = engine.matchOrder(buy);

  assert.equal(fills.length, 1);
  assert.equal(buy.remainingQuantity.toString(), "0.6");
  assert.equal(book.getBestBuy()?.price, 60000);
  assert.equal(book.getBestBuy().getFirstOrder(), buy);
});

test("does not match when limit prices do not cross", () => {
  const { book, engine } = createOrderBook();

  const sell = makeOrder("sell-1", "SELL", 61000, "1");
  const buy = makeOrder("buy-1", "BUY", 60000, "1");

  book.addOrder(sell);

  const fills = engine.matchOrder(buy);

  assert.equal(fills.length, 0);
  assert.equal(buy.remainingQuantity.toString(), "1");
  assert.equal(book.getBestSell()?.price, 61000);
  assert.equal(book.getBestBuy()?.price, 60000);
});

test("incoming SELL matches resting BUY orders", () => {
  const { book, engine } = createOrderBook();

  const buy = makeOrder("buy-1", "BUY", 60000, "1");
  const sell = makeOrder("sell-1", "SELL", 59000, "0.4");

  book.addOrder(buy);

  const fills = engine.matchOrder(sell);

  assert.equal(fills.length, 1);
  assert.equal(fills[0].buyOrderId, "buy-1");
  assert.equal(fills[0].sellOrderId, "sell-1");
  assert.equal(fills[0].quantity, "0.4");

  assert.equal(sell.remainingQuantity.toString(), "0");
  assert.equal(buy.remainingQuantity.toString(), "0.6");
  assert.equal(book.getBestBuy()?.price, 60000);
});

test("incoming SELL matches multiple BUY price levels in priority order", () => {
  const { book, engine } = createOrderBook();

  const buy1 = makeOrder("buy-1", "BUY", 60000, "0.3");
  const buy2 = makeOrder("buy-2", "BUY", 59000, "0.4");
  const buy3 = makeOrder("buy-3", "BUY", 58000, "0.5");

  const sell = makeOrder("sell-1", "SELL", 57000, "0.8");

  book.addOrder(buy1);
  book.addOrder(buy2);
  book.addOrder(buy3);

  const fills = engine.matchOrder(sell);

  assert.deepEqual(
    fills.map((fill) => [fill.buyOrderId, fill.quantity]),
    [
      ["buy-1", "0.3"],
      ["buy-2", "0.4"],
      ["buy-3", "0.1"],
    ],
  );

  assert.equal(sell.remainingQuantity.toString(), "0");
  assert.equal(buy1.remainingQuantity.toString(), "0");
  assert.equal(buy2.remainingQuantity.toString(), "0");
  assert.equal(buy3.remainingQuantity.toString(), "0.4");

  assert.equal(book.getBestBuy()?.price, 58000);
});

test("rejects an incoming order with zero remaining quantity", () => {
  const { book, engine } = createOrderBook();

  const sell = makeOrder("sell-1", "SELL", 59000, "1");
  const buy = makeOrder("buy-1", "BUY", 60000, "0");

  book.addOrder(sell);

  assert.throws(() => engine.matchOrder(buy), /quantity/i);

  assert.equal(sell.remainingQuantity.toString(), "1");
  assert.equal(book.getBestSell()?.price, 59000);
});
test("rejects an incoming order with negative remaining quantity", () => {
  const { book, engine } = createOrderBook();

  const sell = makeOrder("sell-1", "SELL", 59000, "1");
  const buy = makeOrder("buy-1", "BUY", 60000, "-0.5");

  book.addOrder(sell);

  assert.throws(() => engine.matchOrder(buy), /quantity/i);

  assert.equal(sell.remainingQuantity.toString(), "1");
  assert.equal(book.getBestSell()?.price, 59000);
});
test("execution contains correct trade details", () => {
  const { book, engine } = createOrderBook();

  const sell = makeOrder("sell-1", "SELL", 59000, "1");
  const buy = makeOrder("buy-1", "BUY", 60000, "0.4");

  book.addOrder(sell);

  const fills = engine.matchOrder(buy);

  assert.equal(fills.length, 1);

  assert.deepEqual(fills[0], {
    buyOrderId: "buy-1",
    sellOrderId: "sell-1",
    price: 59000,
    quantity: "0.4",
  });
});

test("one incoming order produces multiple executions", () => {
  const { book, engine } = createOrderBook();

  const sell1 = makeOrder("sell-1", "SELL", 59000, "0.3");
  const sell2 = makeOrder("sell-2", "SELL", 60000, "0.4");
  const buy = makeOrder("buy-1", "BUY", 61000, "0.5");

  book.addOrder(sell1);
  book.addOrder(sell2);

  const fills = engine.matchOrder(buy);

  assert.equal(fills.length, 2);

  assert.deepEqual(
    fills.map((fill) => ({
      buyOrderId: fill.buyOrderId,
      sellOrderId: fill.sellOrderId,
      price: fill.price,
      quantity: fill.quantity,
    })),
    [
      {
        buyOrderId: "buy-1",
        sellOrderId: "sell-1",
        price: 59000,
        quantity: "0.3",
      },
      {
        buyOrderId: "buy-1",
        sellOrderId: "sell-2",
        price: 60000,
        quantity: "0.2",
      },
    ],
  );

  assert.equal(buy.remainingQuantity.toString(), "0");
  assert.equal(sell1.remainingQuantity.toString(), "0");
  assert.equal(sell2.remainingQuantity.toString(), "0.2");
});
test("rejects an order from a different market", () => {
  const { book } = createOrderBook("market-btc-usdt");

  const ethOrder = makeOrder(
    "sell-eth-1",
    "SELL",
    3000,
    "1",
    "market-eth-usdt",
  );

  assert.throws(() => book.addOrder(ethOrder), /market does not match/i);

  assert.equal(book.getBestSell(), null);
});
test("rejects an incoming order from a different market", () => {
  const { book, engine } = createOrderBook("market-btc-usdt");

  const restingSell = makeOrder("sell-btc-1", "SELL", 3000, "1");
  const incomingBuy = makeOrder(
    "buy-eth-1",
    "BUY",
    4000,
    "1",
    "market-eth-usdt",
  );

  book.addOrder(restingSell);

  assert.throws(() => engine.matchOrder(incomingBuy), /market does not match/i);

  assert.equal(restingSell.remainingQuantity.toString(), "1");
  assert.equal(incomingBuy.remainingQuantity.toString(), "1");
  assert.equal(book.getBestSell()?.getFirstOrder(), restingSell);
});

test("plans matches without modifying the order book", () => {
  const { book, engine } = createOrderBook();

  const sell1 = makeOrder("sell-1", "SELL", 59000, "0.3");
  const sell2 = makeOrder("sell-2", "SELL", 59000, "0.4");
  const sell3 = makeOrder("sell-3", "SELL", 60000, "0.5");
  const buy = makeOrder("buy-1", "BUY", 61000, "0.8");

  book.addOrder(sell1);
  book.addOrder(sell2);
  book.addOrder(sell3);

  const result = engine.planMatchOrder(buy);

  assert.deepEqual(
    result.fills.map((fill) => [fill.sellOrderId, fill.quantity]),
    [
      ["sell-1", "0.3"],
      ["sell-2", "0.4"],
      ["sell-3", "0.1"],
    ],
  );

  assert.equal(result.remainingQuantity, "0");

  assert.equal(buy.remainingQuantity.toString(), "0.8");
  assert.equal(sell1.remainingQuantity.toString(), "0.3");
  assert.equal(sell2.remainingQuantity.toString(), "0.4");
  assert.equal(sell3.remainingQuantity.toString(), "0.5");

  // The live order book must retain its original queues.
  assert.deepEqual(book.sellLevels.get(59000).orders.queue, [sell1, sell2]);
  assert.deepEqual(book.sellLevels.get(60000).orders.queue, [sell3]);
});

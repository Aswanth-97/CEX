const test = require("node:test");
const assert = require("assert/strict");
const MatchingEngine = require("./MatchingEngine");
const OrderBook = require("./OrderBook");
const orderBookRepository = require("../../repositories/orderBook.repository");
const { initializeMatchingEngine } = require("./initializeMatchingEngine");
const { error } = require("console");

test("initializeMatchingEngine builds an engine from active orders", async () => {
  const originalMethod = orderBookRepository.getAllActiveOrdersForMarket;

  orderBookRepository.getAllActiveOrdersForMarket = async () => [
    {
      id: "buy-1",
      market_id: "market-123",
      side: "BUY",
      price: "60000",
      remaining_quantity: "0.5",
      created_at: new Date("2026-01-01T10:00:00Z"),
    },
    {
      id: "sell-1",
      market_id: "market-123",
      side: "SELL",
      price: "61000",
      remaining_quantity: "0.25",
      created_at: new Date("2026-01-01T10:01:00Z"),
    },
  ];

  try {
    const engine = await initializeMatchingEngine({ marketId: "market-123" });

    assert.ok(engine instanceof MatchingEngine);
    assert.ok(engine.orderbook instanceof OrderBook);

    assert.equal(engine.orderbook.marketId, "market-123");
    assert.equal(engine.orderbook.getBestBuy().price, "60000");
    assert.equal(engine.orderbook.getBestSell().price, "61000");
    assert.equal(
      engine.orderbook.getBestBuy().getFirstOrder().remainingQuantity,
      "0.5",
    );
    assert.equal(
      engine.orderbook.getBestSell().getFirstOrder().remainingQuantity,
      "0.25",
    );
  } finally {
    orderBookRepository.getAllActiveOrdersForMarket = originalMethod;
  }
});

test("nitializeMatchingEngine reject a missing market ID", async () => {
  await assert.rejects(initializeMatchingEngine({ marketId: "" }), (error) => {
    assert.equal(error.message, "Market ID is required");
    return true;
  });
});

test("initializeMatchingEngine propagates repository failures", async () => {
  const originalMethod = orderBookRepository.getAllActiveOrdersForMarket;

  orderBookRepository.getAllActiveOrdersForMarket = () => {
    throw new Error("Database connection failed");
  };

  try {
    await assert.rejects(
      initializeMatchingEngine({ marketId: "market-123" }),
      (error) => {
        assert.equal(error.message, "Database connection failed");
        return true;
      },
    );
  } finally {
    orderBookRepository.getAllActiveOrdersForMarket = originalMethod;
  }
});

test("initializeMatchingEngine rejects an order with an invalid side", async () => {
  const originalMethod = orderBookRepository.getAllActiveOrdersForMarket;

  orderBookRepository.getAllActiveOrdersForMarket = async () => [
    {
      id: "buy-1",
      market_id: "market-123",
      side: "INVALID",
      price: "60000",
      remaining_quantity: "0.5",
      created_at: new Date("2026-01-01T10:00:00Z"),
    },
  ];

  try {
    await assert.rejects(
      initializeMatchingEngine({ marketId: "market-123" }),
      (error) => {
        assert.equal(error.message, "Invalid order side");
        return true;
      },
    );
  } finally {
    orderBookRepository.getAllActiveOrdersForMarket = originalMethod;
  }
});

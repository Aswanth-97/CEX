const test = require("node:test");
const assert = require("assert/strict");
const matchingEngineRegistry = require("./matchingEngineRegistry");
const marketRepository = require("../../repositories/market.repository");
const matchingEngineInitializer = require("./initializeMatchingEngine");

test("getMatchingEngine rejects a missing market ID", () => {
  assert.throws(
    () => matchingEngineRegistry.getMatchingEngine({ marketId: "" }),
    (error) => {
      assert.equal(error.message, "marketId required");
      return true;
    },
  );
});

test("getMatchingEngine rejects an uninitialized market", () => {
  assert.throws(
    () =>
      matchingEngineRegistry.getMatchingEngine({
        marketId: "Unknown_MarketId",
      }),
    (error) => {
      assert.equal(
        error.message,
        "Matching engine not initialized for market Unknown_MarketId",
      );
      return true;
    },
  );
});

test("initializeAll propagates market repository failures", async () => {
  const originalMethod = marketRepository.getAllMarkets;
  marketRepository.getAllMarkets = async () => {
    throw new Error("database Unavailable");
  };

  try {
    await assert.rejects(matchingEngineRegistry.initializeAll(), (error) => {
      assert.equal(error.message, "database Unavailable");
      return true;
    });
  } finally {
    marketRepository.getAllMarkets = originalMethod;
  }
});

test("initializeAll preserves existing engines when initialization fails", async () => {
  const originalGetAllMarkets = marketRepository.getAllMarkets;
  const originalInitializer =
    matchingEngineInitializer.initializeMatchingEngine;

  const btcMarketId = "11111111-1111-4111-8111-111111111111";
  const ethMarketId = "22222222-2222-4222-8222-222222222222";

  const existingBtcEngine = { name: "existing-btc-engine" };

  let markets = [{ id: btcMarketId, status: "ACTIVE" }];

  marketRepository.getAllMarkets = async () => markets;

  matchingEngineInitializer.initializeMatchingEngine = async ({ marketId }) => {
    if (marketId === btcMarketId && markets.length === 1) {
      return existingBtcEngine;
    }

    if (marketId === btcMarketId) {
      return { name: "new-btc-engine" };
    }

    if (marketId === ethMarketId) {
      throw new Error("ETH engine initialization failed");
    }

    throw new Error(`Unexpected market ID: ${marketId}`);
  };

  try {
    // First, register the existing BTC engine successfully.
    await matchingEngineRegistry.initializeAll();

    assert.strictEqual(
      matchingEngineRegistry.getMatchingEngine({ marketId: btcMarketId }),
      existingBtcEngine,
    );

    // Now try to initialize BTC and ETH together.
    markets = [
      { id: btcMarketId, status: "ACTIVE" },
      { id: ethMarketId, status: "ACTIVE" },
    ];

    await assert.rejects(
      matchingEngineRegistry.initializeAll(),
      /ETH engine initialization failed/,
    );

    // The original BTC engine must still be registered.
    assert.strictEqual(
      matchingEngineRegistry.getMatchingEngine({ marketId: btcMarketId }),
      existingBtcEngine,
    );
  } finally {
    marketRepository.getAllMarkets = originalGetAllMarkets;
    matchingEngineInitializer.initializeMatchingEngine = originalInitializer;
  }
});

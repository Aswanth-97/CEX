const test = require("node:test");
const assert = require("node:assert/strict");
const pool = require("../../config/db");
const orderRepository = require("../../repositories/order.repository");
const trdeRepository = require("../../repositories/trade.repository");
const marketRepository = require("../../repositories/market.repository");
const balanceRepository = require("../../repositories/balance.repository");

const { executeTrade } = require("../../services/trade.service");
const { release } = require("node:os");
const { error } = require("node:console");
const { Assert } = require("node:assert");

test("executeTrade propagates BEGIN failure and releases the client", async () => {
  const originalConnect = pool.connect;
  const beginError = new Error("Simulated BEGIN failure");

  let released = false;
  const queries = [];

  const fakeClient = {
    query: async (sql) => {
      queries.push(sql);

      if (sql === "BEGIN") {
        throw beginError;
      }
    },

    release: () => {
      released = true;
    },
  };

  pool.connect = async () => fakeClient;

  try {
    await assert.rejects(
      executeTrade({
        buyOrderId: "buy-test",
        sellOrderId: "sell-test",
        price: "100",
        quantity: "1",
      }),
      (error) => error === beginError,
    );

    assert.deepEqual(queries, ["BEGIN"]);
    assert.equal(released, true);
  } finally {
    pool.connect = originalConnect;
  }
});

test("executeTrade rolls back when fetching orders fails", async () => {
  const originalConnect = pool.connect;
  const originalGetOrders = orderRepository.getOrdersForUpdate;

  const orderError = new Error("Simulated order-fetch failure");

  const queries = [];

  let released = false;

  const fakeClient = {
    query: async (sql) => {
      queries.push(sql);
      return { rows: [] };
    },
    release: () => {
      released = true;
    },
  };

  pool.connect = async () => fakeClient;

  orderRepository.getOrdersForUpdate = async () => {
    throw orderError;
  };

  try {
    await assert.rejects(
      executeTrade({
        buyOrderId: "buy-test",
        sellOrderId: "sell-test",
        price: "100",
        quantity: "1",
      }),
      (error) => error === orderError,
    );

    assert.deepEqual(queries, ["BEGIN", "ROLLBACK"]);
    assert.equal(released, true);
  } finally {
    pool.connect = originalConnect;
    orderRepository.getOrdersForUpdate = originalGetOrders;
  }
});

test("executeTrade rejects orders from different markets", async () => {
  const originalConnect = pool.connect;
  const originalGetOrders = orderRepository.getOrdersForUpdate;

  const queries = [];
  let released = false;
  let tradeCreationCalled = false;

  const fakeClient = {
    query: async (sql) => {
      queries.push(sql);
    },
    release: () => {
      released = true;
    },
  };

  pool.connect = async () => fakeClient;

  orderRepository.getOrdersForUpdate = () => [
    {
      id: "buy-test",
      side: "BUY",
      market_id: "market-btc-usdt",
      status: "NEW",
      price: "100",
      remaining_quantity: "1",
    },
    {
      id: "sell-test",
      side: "SELL",
      market_id: "market-eth-usdt",
      status: "NEW",
      price: "90",
      remaining_quantity: "1",
    },
  ];

  const originalCreateTrade = trdeRepository.createTradeWithClient;

  trdeRepository.createTradeWithClient = async () => {
    tradeCreationCalled = true;
    throw new Error("Trade creation should not be reached");
  };

  try {
    await assert.rejects(
      executeTrade({
        buyOrderId: "buy-test",
        sellOrderId: "sell-test",
        price: "95",
        quantity: "1",
      }),
      (error) => {
        assert.equal(error.message, "Orders must belong to the same market");
        assert.equal(error.statusCode, 400);
        return true;
      },
    );
    assert.deepEqual(queries, ["BEGIN", "ROLLBACK"]);
    assert.equal(tradeCreationCalled, false);
    assert.equal(released, true);
  } finally {
    pool.connect = originalConnect;
    orderRepository.getOrdersForUpdate = originalGetOrders;
    trdeRepository.createTradeWithClient = originalCreateTrade;
  }
});

test("executeTrade rejects cancelled orders", async () => {
  const originalConnect = pool.connect;
  const originalGetOrders = orderRepository.getOrdersForUpdate;

  const queries = [];
  let relesed = false;
  let tradeCreationCalled = false;

  const fakeClient = {
    query: async (sql) => {
      queries.push(sql);
    },
    release: () => {
      relesed = true;
    },
  };

  pool.connect = async () => fakeClient;

  orderRepository.getOrdersForUpdate = async () => [
    {
      id: "buy-test",
      side: "BUY",
      market_id: "market-btc-usdt",
      status: "NEW",
      price: "100",
      remaining_quantity: "1",
    },
    {
      id: "sell-test",
      side: "SELL",
      market_id: "market-btc-usdt",
      status: "CANCELLED",
      price: "90",
      remaining_quantity: "1",
    },
  ];

  const originalCreateTrade = trdeRepository.createTradeWithClient;

  trdeRepository.createTradeWithClient = async () => {
    tradeCreationCalled = true;
    throw new Error("Trade creation should not be reached");
  };

  try {
    await assert.rejects(
      executeTrade({
        buyOrderId: "buy-test",
        sellOrderId: "sell-test",
        price: "95",
        quantity: "1",
      }),
      (error) => {
        assert.equal(error.message, "Both orders must be active");
        assert.equal(error.statusCode, 409);
        return true;
      },
    );

    assert.deepEqual(queries, ["BEGIN", "ROLLBACK"]);
    assert.equal(tradeCreationCalled, false);
    assert.equal(relesed, true);
  } finally {
    pool.connect = originalConnect;
    trdeRepository.createTradeWithClient = originalCreateTrade;
    orderRepository.getOrdersForUpdate = originalGetOrders;
  }
});

test("exicuteTrade rejects execution price above BUY limit", async () => {
  const originalConnect = pool.connect;
  const originalGetOrders = orderRepository.getOrdersForUpdate;
  const originalCreateTrade = trdeRepository.createTradeWithClient;

  const queries = [];
  let released = false;
  let tradeCreationCalled = false;

  const fakeClient = {
    query: async (sql) => {
      queries.push(sql);
    },
    release: () => {
      released = true;
    },
  };

  pool.connect = async () => fakeClient;

  trdeRepository.createTradeWithClient = async () => {
    tradeCreationCalled = true;
    throw new Error("Trade creation should not be reached");
  };

  orderRepository.getOrdersForUpdate = async () => [
    {
      id: "buy-test",
      side: "BUY",
      market_id: "market-btc-usdt",
      status: "NEW",
      price: "100",
      remaining_quantity: "1",
    },
    {
      id: "sell-test",
      side: "SELL",
      market_id: "market-btc-usdt",
      status: "NEW",
      price: "90",
      remaining_quantity: "1",
    },
  ];

  try {
    await assert.rejects(
      executeTrade({
        buyOrderId: "buy-test",
        sellOrderId: "sell-test",
        price: "105",
        quantity: "1",
      }),
      (error) => {
        assert.equal(
          error.message,
          "Execution price is outside the permitted order prices",
        );
        assert.equal(error.statusCode, 400);
        return true;
      },
    );
    assert.deepEqual(queries, ["BEGIN", "ROLLBACK"]);
    assert.equal(released, true);
    assert.equal(tradeCreationCalled, false);
  } finally {
    pool.connect = originalConnect;
    trdeRepository.createTradeWithClient = originalCreateTrade;
    orderRepository.getOrdersForUpdate = originalGetOrders;
  }
});

test("exicuteTrade rejects execution price below SELL limit", async () => {
  const originalConnect = pool.connect;
  const originalGetOrders = orderRepository.getOrdersForUpdate;
  const originalCreateTrade = trdeRepository.createTradeWithClient;

  const queries = [];
  let released = false;
  let tradeCreationCalled = false;

  const fakeClient = {
    query: async (sql) => {
      queries.push(sql);
    },
    release: () => {
      released = true;
    },
  };

  pool.connect = async () => fakeClient;

  trdeRepository.createTradeWithClient = async () => {
    tradeCreationCalled = true;
    throw new Error("Trade creation should not be reached");
  };

  orderRepository.getOrdersForUpdate = async () => [
    {
      id: "buy-test",
      side: "BUY",
      market_id: "market-btc-usdt",
      status: "NEW",
      price: "100",
      remaining_quantity: "1",
    },
    {
      id: "sell-test",
      side: "SELL",
      market_id: "market-btc-usdt",
      status: "NEW",
      price: "90",
      remaining_quantity: "1",
    },
  ];

  try {
    await assert.rejects(
      executeTrade({
        buyOrderId: "buy-test",
        sellOrderId: "sell-test",
        price: "80",
        quantity: "1",
      }),
      (error) => {
        assert.equal(
          error.message,
          "Execution price is outside the permitted order prices",
        );
        assert.equal(error.statusCode, 400);
        return true;
      },
    );
    assert.deepEqual(queries, ["BEGIN", "ROLLBACK"]);
    assert.equal(released, true);
    assert.equal(tradeCreationCalled, false);
  } finally {
    pool.connect = originalConnect;
    trdeRepository.createTradeWithClient = originalCreateTrade;
    orderRepository.getOrdersForUpdate = originalGetOrders;
  }
});

test("exicuteTrade rejects quantity above SELL remaining quantity", async () => {
  const originalConnect = pool.connect;
  const originalGetOrders = orderRepository.getOrdersForUpdate;
  const originalCreateTrade = trdeRepository.createTradeWithClient;

  const queries = [];
  let released = false;
  let tradeCreationCalled = false;

  const fakeClient = {
    query: async (sql) => {
      queries.push(sql);
    },
    release: () => {
      released = true;
    },
  };

  pool.connect = async () => fakeClient;

  trdeRepository.createTradeWithClient = async () => {
    tradeCreationCalled = true;
    throw new Error("Trade creation should not be reached");
  };

  orderRepository.getOrdersForUpdate = async () => [
    {
      id: "buy-test",
      side: "BUY",
      market_id: "market-btc-usdt",
      status: "NEW",
      price: "100",
      remaining_quantity: "1",
    },
    {
      id: "sell-test",
      side: "SELL",
      market_id: "market-btc-usdt",
      status: "NEW",
      price: "90",
      remaining_quantity: "0.5",
    },
  ];

  try {
    await assert.rejects(
      executeTrade({
        buyOrderId: "buy-test",
        sellOrderId: "sell-test",
        price: "95",
        quantity: "0.6",
      }),
      (error) => {
        assert.equal(
          error.message,
          "Trade quantity exceeds an order's remaining quantity",
        );
        assert.equal(error.statusCode, 400);
        return true;
      },
    );
    assert.deepEqual(queries, ["BEGIN", "ROLLBACK"]);
    assert.equal(released, true);
    assert.equal(tradeCreationCalled, false);
  } finally {
    pool.connect = originalConnect;
    trdeRepository.createTradeWithClient = originalCreateTrade;
    orderRepository.getOrdersForUpdate = originalGetOrders;
  }
});

test("executeTrade successfully executes a partial fill", async () => {
  const originalConnect = pool.connect;
  const originalCreateTrade = trdeRepository.createTradeWithClient;
  const originalGetOrders = orderRepository.getOrdersForUpdate;
  const originalUpdateOrderFills = orderRepository.updateOrderFillWithClient;
  const originalGetMarket = marketRepository.getMarketByIdWithClient;
  const originalCreditBalance = balanceRepository.creditBalance;
  const originalFinalizeBalance = balanceRepository.finalizeWithdrawalBalance;

  balanceRepository.creditBalance = async () => ({});
  balanceRepository.finalizeWithdrawalBalance = async () => ({});

  const queries = [];
  let released = false;
  const updateCalls = [];

  const fakeClient = {
    query: async (sql) => {
      queries.push(sql);
      return { rows: [] };
    },
    release: () => {
      released = true;
    },
  };

  pool.connect = async () => fakeClient;

  marketRepository.getMarketByIdWithClient = async ({ client, marketId }) => {
    assert.equal(client, fakeClient);
    assert.equal(marketId, "market-btc-usdt");

    return {
      id: "market-btc-usdt",
      base_asset_id: "asset-btc",
      quote_asset_id: "asset-usdt",
    };
  };

  const buyOrder = {
    id: "buy-test",
    side: "BUY",
    market_id: "market-btc-usdt",
    status: "NEW",
    price: "100",
    quantity: "1",
    filled_quantity: "0.4",
    remaining_quantity: "0.6",
  };

  const sellOrder = {
    id: "sell-test",
    side: "SELL",
    market_id: "market-btc-usdt",
    status: "NEW",
    price: "90",
    quantity: "0.5",
    filled_quantity: "0",
    remaining_quantity: "0.5",
  };

  const updatedBuyOrder = {
    ...buyOrder,
    filled_quantity: "0.9",
    remaining_quantity: "0.1",
    status: "PARTIALLY_FILLED",
  };

  const updatedSellOrder = {
    ...sellOrder,
    filled_quantity: "0.5",
    remaining_quantity: "0",
    status: "FILLED",
  };

  const fakeTrade = {
    id: "trade-test",
    market_id: "market-btc-usdt",
    buy_order_id: "buy-test",
    sell_order_id: "sell-test",
    price: "95",
    quantity: "0.5",
  };

  orderRepository.getOrdersForUpdate = async () => [buyOrder, sellOrder];

  trdeRepository.createTradeWithClient = async (args) => {
    assert.equal(args.client, fakeClient);
    assert.equal(args.buyOrderId, "buy-test");
    assert.equal(args.sellOrderId, "sell-test");
    assert.equal(args.marketId, "market-btc-usdt");
    assert.equal(args.price, "95");
    assert.equal(args.quantity, "0.5");

    return fakeTrade;
  };

  orderRepository.updateOrderFillWithClient = async (args) => {
    updateCalls.push(args);

    if (args.orderId === "buy-test") {
      return updatedBuyOrder;
    }
    if (args.orderId === "sell-test") {
      return updatedSellOrder;
    }

    return null;
  };

  try {
    const result = await executeTrade({
      buyOrderId: "buy-test",
      sellOrderId: "sell-test",
      price: "95",
      quantity: "0.5",
    });

    assert.equal(result.trade, fakeTrade);
    assert.equal(result.buyOrder.remaining_quantity, "0.1");
    assert.equal(result.buyOrder.status, "PARTIALLY_FILLED");

    assert.equal(result.sellOrder.remaining_quantity, "0");
    assert.equal(result.sellOrder.status, "FILLED");

    assert.equal(updateCalls.length, 2);

    assert.deepEqual(
      updateCalls.map(({ orderId, filledQuantity }) => ({
        orderId,
        filledQuantity,
      })),
      [
        { orderId: "buy-test", filledQuantity: "0.5" },
        { orderId: "sell-test", filledQuantity: "0.5" },
      ],
    );

    assert.deepEqual(queries, ["BEGIN", "COMMIT"]);
    assert.equal(released, true);
  } finally {
    pool.connect = originalConnect;
    orderRepository.getOrdersForUpdate = originalGetOrders;
    trdeRepository.createTradeWithClient = originalCreateTrade;
    orderRepository.updateOrderFillWithClient = originalUpdateOrderFills;
    marketRepository.getMarketByIdWithClient = originalGetMarket;
    balanceRepository.creditBalance = originalCreditBalance;
    balanceRepository.finalizeWithdrawalBalance = originalFinalizeBalance;
  }
});

test("executeTrade rolls back when SELL order fill update fails", async () => {
  const originalConnect = pool.connect;
  const originalCreateTrade = trdeRepository.createTradeWithClient;
  const originalGetOrders = orderRepository.getOrdersForUpdate;
  const originalUpdateOrderFills = orderRepository.updateOrderFillWithClient;
  const originalGetMarket = marketRepository.getMarketByIdWithClient;
  const originalCreditBalance = balanceRepository.creditBalance;
  const originalFinalizeBalance = balanceRepository.finalizeWithdrawalBalance;

  balanceRepository.creditBalance = async () => ({});
  balanceRepository.finalizeWithdrawalBalance = async () => ({});

  const queries = [];
  let released = false;
  const updateCalls = [];

  const buyOrder = {
    id: "buy-test",
    side: "BUY",
    market_id: "market-btc-usdt",
    status: "NEW",
    price: "100",
    quantity: "1",
    filled_quantity: "0.4",
    remaining_quantity: "0.6",
  };

  const sellOrder = {
    id: "sell-test",
    side: "SELL",
    market_id: "market-btc-usdt",
    status: "NEW",
    price: "90",
    quantity: "0.5",
    filled_quantity: "0",
    remaining_quantity: "0.5",
  };

  const fakeClient = {
    query: async (sql) => {
      queries.push(sql);
      return { rows: [] };
    },
    release: () => {
      released = true;
    },
  };

  marketRepository.getMarketByIdWithClient = async ({ client, marketId }) => {
    assert.equal(client, fakeClient);
    assert.equal(marketId, "market-btc-usdt");

    return {
      id: "market-btc-usdt",
      base_asset_id: "asset-btc",
      quote_asset_id: "asset-usdt",
    };
  };

  const fakeTrade = {
    id: "trade-test",
    market_id: "market-btc-usdt",
    buy_order_id: "buy-test",
    sell_order_id: "sell-test",
    price: "95",
    quantity: "0.5",
  };

  const updatedBuyOrder = {
    ...buyOrder,
    filled_quantity: "0.9",
    remaining_quantity: "0.1",
    status: "PARTIALLY_FILLED",
  };

  pool.connect = async () => fakeClient;

  orderRepository.getOrdersForUpdate = async () => [buyOrder, sellOrder];

  trdeRepository.createTradeWithClient = async (args) => {
    assert.equal(args.client, fakeClient);
    assert.equal(args.buyOrderId, "buy-test");
    assert.equal(args.sellOrderId, "sell-test");
    assert.equal(args.marketId, "market-btc-usdt");
    assert.equal(args.price, "95");
    assert.equal(args.quantity, "0.5");

    return fakeTrade;
  };

  orderRepository.updateOrderFillWithClient = async (args) => {
    updateCalls.push(args.orderId);

    if (args.orderId === "buy-test") {
      return updatedBuyOrder;
    }

    throw new Error("Simulated SELL order update failure");
  };

  try {
    await assert.rejects(
      executeTrade({
        buyOrderId: "buy-test",
        sellOrderId: "sell-test",
        price: "95",
        quantity: "0.5",
      }),
      (error) => {
        assert.equal(error.message, "Simulated SELL order update failure");
        return true;
      },
    );

    assert.deepEqual(updateCalls, ["buy-test", "sell-test"]);
    assert.deepEqual(queries, ["BEGIN", "ROLLBACK"]);
    assert.equal(queries.includes("COMMIT"), false);
    assert.equal(released, true);
  } finally {
    pool.connect = originalConnect;
    orderRepository.getOrdersForUpdate = originalGetOrders;
    trdeRepository.createTradeWithClient = originalCreateTrade;
    orderRepository.updateOrderFillWithClient = originalUpdateOrderFills;
    balanceRepository.creditBalance = originalCreditBalance;
    balanceRepository.finalizeWithdrawalBalance = originalFinalizeBalance;
  }
});

test("executeTrade succeeds when execution price equals BUY limit", async () => {
  const originalConnect = pool.connect;
  const originalCreateTrade = trdeRepository.createTradeWithClient;
  const originalGetOrders = orderRepository.getOrdersForUpdate;
  const originalUpdateOrderFills = orderRepository.updateOrderFillWithClient;
  const originalGetMarket = marketRepository.getMarketByIdWithClient;
  const originalCreditBalance = balanceRepository.creditBalance;
  const originalFinalizeBalance = balanceRepository.finalizeWithdrawalBalance;

  balanceRepository.finalizeWithdrawalBalance = async () => ({});

  const queries = [];
  const creditCalls = [];
  let released = false;
  const updateCalls = [];

  const fakeClient = {
    query: async (sql) => {
      queries.push(sql);
      return { rows: [] };
    },
    release: () => {
      released = true;
    },
  };

  balanceRepository.creditBalance = async (args) => {
    creditCalls.push(args);
    return {};
  };

  pool.connect = async () => fakeClient;

  marketRepository.getMarketByIdWithClient = async ({ client, marketId }) => {
    assert.equal(client, fakeClient);
    assert.equal(marketId, "market-btc-usdt");

    return {
      id: "market-btc-usdt",
      base_asset_id: "asset-btc",
      quote_asset_id: "asset-usdt",
    };
  };

  const buyOrder = {
    id: "buy-test",
    side: "BUY",
    market_id: "market-btc-usdt",
    status: "NEW",
    price: "100",
    quantity: "1",
    filled_quantity: "0",
    remaining_quantity: "1",
    account_id: "account-buyer",
  };

  const sellOrder = {
    id: "sell-test",
    side: "SELL",
    market_id: "market-btc-usdt",
    status: "NEW",
    price: "100",
    quantity: "0.5",
    filled_quantity: "0",
    remaining_quantity: "0.5",
    account_id: "account-seller",
  };

  const updatedBuyOrder = {
    ...buyOrder,
    filled_quantity: "0.5",
    remaining_quantity: "0.5",
    status: "PARTIALLY_FILLED",
  };

  const updatedSellOrder = {
    ...sellOrder,
    filled_quantity: "0.5",
    remaining_quantity: "0",
    status: "FILLED",
  };

  const fakeTrade = {
    id: "trade-test",
    market_id: "market-btc-usdt",
    buy_order_id: "buy-test",
    sell_order_id: "sell-test",
    price: "100",
    quantity: "0.5",
  };

  orderRepository.getOrdersForUpdate = async () => [buyOrder, sellOrder];

  trdeRepository.createTradeWithClient = async (args) => {
    assert.equal(args.client, fakeClient);
    assert.equal(args.buyOrderId, "buy-test");
    assert.equal(args.sellOrderId, "sell-test");
    assert.equal(args.marketId, "market-btc-usdt");
    assert.equal(args.price, "100");
    assert.equal(args.quantity, "0.5");

    return fakeTrade;
  };

  orderRepository.updateOrderFillWithClient = async (args) => {
    updateCalls.push(args);

    if (args.orderId === "buy-test") {
      return updatedBuyOrder;
    }
    if (args.orderId === "sell-test") {
      return updatedSellOrder;
    }

    return null;
  };

  try {
    const result = await executeTrade({
      buyOrderId: "buy-test",
      sellOrderId: "sell-test",
      price: "100",
      quantity: "0.5",
    });

    console.log(
      "Actual credit calls:",
      creditCalls.map(({ accountId, assetId, amount }) => ({
        accountId,
        assetId,
        amount,
      })),
    );

    assert.equal(result.trade, fakeTrade);
    assert.equal(result.buyOrder.remaining_quantity, "0.5");
    assert.equal(result.buyOrder.status, "PARTIALLY_FILLED");

    assert.equal(result.sellOrder.remaining_quantity, "0");
    assert.equal(result.sellOrder.status, "FILLED");

    assert.equal(updateCalls.length, 2);

    assert.deepEqual(
      updateCalls.map(({ orderId, filledQuantity }) => ({
        orderId,
        filledQuantity,
      })),
      [
        { orderId: "buy-test", filledQuantity: "0.5" },
        { orderId: "sell-test", filledQuantity: "0.5" },
      ],
    );

    assert.deepEqual(queries, ["BEGIN", "COMMIT"]);
    assert.equal(released, true);

    assert.equal(creditCalls.length, 2);

    assert.deepEqual(
      creditCalls.map(({ accountId, assetId, amount }) => ({
        accountId,
        assetId,
        amount,
      })),
      [
        {
          accountId: "account-seller",
          assetId: "asset-usdt",
          amount: "50",
        },
        {
          accountId: "account-buyer",
          assetId: "asset-btc",
          amount: "0.5",
        },
      ],
    );
  } finally {
    pool.connect = originalConnect;
    orderRepository.getOrdersForUpdate = originalGetOrders;
    trdeRepository.createTradeWithClient = originalCreateTrade;
    orderRepository.updateOrderFillWithClient = originalUpdateOrderFills;
    marketRepository.getMarketByIdWithClient = originalGetMarket;
    balanceRepository.creditBalance = originalCreditBalance;
    balanceRepository.finalizeWithdrawalBalance = originalFinalizeBalance;
  }
});

test("executeTrade refunds buyer when execution price is below BUY limit", async () => {
  const originalConnect = pool.connect;
  const originalCreateTrade = trdeRepository.createTradeWithClient;
  const originalGetOrders = orderRepository.getOrdersForUpdate;
  const originalUpdateOrderFills = orderRepository.updateOrderFillWithClient;
  const originalGetMarket = marketRepository.getMarketByIdWithClient;
  const originalCreditBalance = balanceRepository.creditBalance;
  const originalFinalizeBalance = balanceRepository.finalizeWithdrawalBalance;

  balanceRepository.finalizeWithdrawalBalance = async () => ({});

  const queries = [];
  const creditCalls = [];
  let released = false;
  const updateCalls = [];

  const fakeClient = {
    query: async (sql) => {
      queries.push(sql);
      return { rows: [] };
    },
    release: () => {
      released = true;
    },
  };

  balanceRepository.creditBalance = async (args) => {
    creditCalls.push(args);
    return {};
  };

  pool.connect = async () => fakeClient;

  marketRepository.getMarketByIdWithClient = async ({ client, marketId }) => {
    assert.equal(client, fakeClient);
    assert.equal(marketId, "market-btc-usdt");

    return {
      id: "market-btc-usdt",
      base_asset_id: "asset-btc",
      quote_asset_id: "asset-usdt",
    };
  };

  const buyOrder = {
    id: "buy-test",
    side: "BUY",
    market_id: "market-btc-usdt",
    status: "NEW",
    price: "100",
    quantity: "1",
    filled_quantity: "0",
    remaining_quantity: "1",
    account_id: "account-buyer",
  };

  const sellOrder = {
    id: "sell-test",
    side: "SELL",
    market_id: "market-btc-usdt",
    status: "NEW",
    price: "95",
    quantity: "0.5",
    filled_quantity: "0",
    remaining_quantity: "0.5",
    account_id: "account-seller",
  };

  const updatedBuyOrder = {
    ...buyOrder,
    filled_quantity: "0.5",
    remaining_quantity: "0.5",
    status: "PARTIALLY_FILLED",
  };

  const updatedSellOrder = {
    ...sellOrder,
    filled_quantity: "0.5",
    remaining_quantity: "0",
    status: "FILLED",
  };

  const fakeTrade = {
    id: "trade-test",
    market_id: "market-btc-usdt",
    buy_order_id: "buy-test",
    sell_order_id: "sell-test",
    price: "95",
    quantity: "0.5",
  };

  orderRepository.getOrdersForUpdate = async () => [buyOrder, sellOrder];

  trdeRepository.createTradeWithClient = async (args) => {
    assert.equal(args.client, fakeClient);
    assert.equal(args.buyOrderId, "buy-test");
    assert.equal(args.sellOrderId, "sell-test");
    assert.equal(args.marketId, "market-btc-usdt");
    assert.equal(args.price, "95");
    assert.equal(args.quantity, "0.5");

    return fakeTrade;
  };

  orderRepository.updateOrderFillWithClient = async (args) => {
    updateCalls.push(args);

    if (args.orderId === "buy-test") {
      return updatedBuyOrder;
    }
    if (args.orderId === "sell-test") {
      return updatedSellOrder;
    }

    return null;
  };

  try {
    const result = await executeTrade({
      buyOrderId: "buy-test",
      sellOrderId: "sell-test",
      price: "95",
      quantity: "0.5",
    });

  

    assert.equal(result.trade, fakeTrade);
    assert.equal(result.buyOrder.remaining_quantity, "0.5");
    assert.equal(result.buyOrder.status, "PARTIALLY_FILLED");

    assert.equal(result.sellOrder.remaining_quantity, "0");
    assert.equal(result.sellOrder.status, "FILLED");

    assert.equal(updateCalls.length, 2);

    assert.deepEqual(
      updateCalls.map(({ orderId, filledQuantity }) => ({
        orderId,
        filledQuantity,
      })),
      [
        { orderId: "buy-test", filledQuantity: "0.5" },
        { orderId: "sell-test", filledQuantity: "0.5" },
      ],
    );

    assert.deepEqual(queries, ["BEGIN", "COMMIT"]);
    assert.equal(released, true);

    assert.equal(creditCalls.length, 3);

    assert.deepEqual(
      creditCalls.map(({ accountId, assetId, amount }) => ({
        accountId,
        assetId,
        amount,
      })),
      [
        {
          accountId: "account-seller",
          assetId: "asset-usdt",
          amount: "47.5",
        },
        {
          accountId: "account-buyer",
          assetId: "asset-btc",
          amount: "0.5",
        },
        {
          accountId: "account-buyer",
          assetId: "asset-usdt",
          amount: "2.5",
        },
      ],
    );
  } finally {
    pool.connect = originalConnect;
    orderRepository.getOrdersForUpdate = originalGetOrders;
    trdeRepository.createTradeWithClient = originalCreateTrade;
    orderRepository.updateOrderFillWithClient = originalUpdateOrderFills;
    marketRepository.getMarketByIdWithClient = originalGetMarket;
    balanceRepository.creditBalance = originalCreditBalance;
    balanceRepository.finalizeWithdrawalBalance = originalFinalizeBalance;
  }
});

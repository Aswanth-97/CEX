const pool = require("../config/db");
const logger = require("../utils/logger");
const accountRepository = require("../repositories/account.repository");
const marketRepository = require("../repositories/market.repository");
const balanceRepository = require("../repositories/balance.repository");
const orderRepository = require("../repositories/order.repository");

const getDecimalPlaces = (value) => {
  const stringValue = String(value);

  if (!/^\d+(\.\d+)?$/.test(stringValue)) {
    return null;
  }

  const decimalPart = stringValue.split(".")[1];

  return decimalPart ? decimalPart.length : 0;
};

const createOrder = async ({
  marketId,
  clientOrderId,
  side,
  orderType = "LIMIT",
  price,
  quantity,
  userId,
  requestId,
}) => {
  logger.info(
    {
      requestId,
      userId,
      marketId,
      clientOrderId,
      side,
      orderType,
      price,
      quantity,
    },
    "Order creation requested",
  );

  const account = await accountRepository.getAccountByUserId({ userId });

  if (!account) {
    logger.warn(
      {
        requestId,
        userId,
        marketId,
      },
      "Order Rejected:Account not found",
    );

    const error = new Error("Account not found");
    error.statusCode = 404;
    throw error;
  }

  if (account.account_status !== "ACTIVE") {
    logger.warn(
      {
        requestId,
        userId,
        marketId,
      },
      "Order Rejected:Account is not active",
    );

    const error = new Error("Account is not active");
    error.statusCode = 404;
    throw error;
  }

  const market = await marketRepository.getMarketById({ marketId });

  if (!market) {
    logger.warn(
      {
        requestId,
        accountId: account.id,
        marketId,
      },
      "Order rejected: market not found",
    );
    const error = new Error("Market not found");
    error.statusCode = 404;
    throw error;
  }

  if (market.status !== "ACTIVE") {
    logger.warn(
      {
        requestId,
        accountId: account.id,
        marketId,
        marketStatus: market.status,
      },
      "Order rejected: market is not active",
    );

    const error = new Error("Market is not active");
    error.statusCode = 400;
    throw error;
  }

  if (orderType !== "LIMIT") {
    const error = new Error("Only LIMIT orders are supported");
    error.statusCode = 400;
    throw error;
  }

  if (!["BUY", "SELL"].includes(side)) {
    const error = new Error("Invalid order side");
    error.statusCode = 400;
    throw error;
  }

  const priceDecimals = getDecimalPlaces(price);
  const quantityDecimals = getDecimalPlaces(quantity);

  if (priceDecimals === null || quantityDecimals === null) {
    const error = new Error("Price and quantity must be valid decimal values");
    error.statusCode = 400;
    throw error;
  }

  if (priceDecimals > market.price_precision) {
    const error = new Error(
      `Price precision cannot exceed ${market.price_precision} decimals`,
    );
    error.statusCode = 400;
    throw error;
  }

  if (quantityDecimals > market.quantity_precision) {
    const error = new Error(
      `Quantity precision cannot exceed ${market.quantity_precision} decimals`,
    );
    error.statusCode = 400;
    throw error;
  }

  const baseAssetDecimals = market.base_asset_decimals;
  // const quoteAssetDecimals = market.quote_asset_decimals;

  if (baseAssetDecimals === undefined) {
    logger.error(
      {
        requestId,
        accountId: account.id,
        marketId,
      },
      "Market asset precision information is missing",
    );

    const error = new Error("Market asset information is incomplete");
    error.statusCode = 500;
    throw error;
  }

  if (quantityDecimals > baseAssetDecimals) {
    const error = new Error(
      `Quantity precision cannot exceed base asset precision of ${baseAssetDecimals}`,
    );
    error.statusCode = 400;
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const numericValidationResult = await client.query(
      `
    SELECT
      $1::NUMERIC > 0 AS price_valid,
      $2::NUMERIC > 0 AS quantity_valid,
      $2::NUMERIC >= $3::NUMERIC AS quantity_min_valid,
      ($1::NUMERIC * $2::NUMERIC) >= $4::NUMERIC AS notional_min_valid
  `,
      [price, quantity, market.min_quantity, market.min_notional],
    );

    const {
      price_valid: priceValid,
      quantity_valid: quantityValid,
      quantity_min_valid: quantityMinValid,
      notional_min_valid: notionalMinValid,
    } = numericValidationResult.rows[0];

    if (!priceValid || !quantityValid) {
      const error = new Error("Price and quantity must be greater than zero");
      error.statusCode = 400;
      throw error;
    }
    if (!quantityMinValid) {
      const error = new Error(
        `Quantity must be at least ${market.min_quantity}`,
      );
      error.statusCode = 400;
      throw error;
    }

    if (!notionalMinValid) {
      const error = new Error(
        `Order notional must be at least ${market.min_notional}`,
      );
      error.statusCode = 400;
      throw error;
    }

    const notionalResult = await client.query(
      `SELECT $1::NUMERIC * $2::NUMERIC AS notional`,
      [price, quantity],
    );

    const notional = notionalResult.rows[0].notional;

    const balanceAssetId =
      side === "BUY" ? market.quote_asset_id : market.base_asset_id;

    const requiredBalance = side === "BUY" ? notional : quantity;

    logger.info(
      {
        requestId,
        accountId: account.id,
        marketId,
        side,
        balanceAssetId,
        requiredBalance,
        notional,
      },
      "Checking order balance",
    );

    const balance = await balanceRepository.getBalanceForUpdate({
      accountId: account.id,
      assetId: balanceAssetId,
      client,
    });

    if (!balance) {
      const error = new Error("Balance not found");
      error.statusCode = 400;
      throw error;
    }

    const lockedBalance = await balanceRepository.lockBalanceForOrder({
      client,
      balanceId: balance.id,
      amount: requiredBalance,
    });

    if (!lockedBalance) {
      logger.warn(
        {
          requestId,
          accountId: account.id,
          marketId,
          assetId: balanceAssetId,
          requiredBalance,
          availableBalance: balance.available_balance,
        },
        "Order rejected: insufficient available balance",
      );

      const error = new Error("Insufficient available balance");
      error.statusCode = 400;
      throw error;
    }

    logger.info(
      {
        requestId,
        accountId: account.id,
        marketId,
        assetId: balanceAssetId,
        lockedAmount: requiredBalance,
      },
      "Order balance locked",
    );

    const order = await orderRepository.createOrderWithClient({
      client,
      accountId: account.id,
      marketId,
      clientOrderId,
      side,
      orderType,
      price,
      quantity,
    });

    await client.query("COMMIT");

    logger.info(
      {
        requestId,
        orderId: order.id,
        accountId: account.id,
        marketId,
        side,
        orderType,
        price,
        quantity,
        lockedAmount: requiredBalance,
        status: order.status,
      },
      "Order created successfully",
    );

    return order;
  } catch (error) {
    await client.query("ROLLBACK");

    logger.error(
      {
        requestId,
        userId,
        accountId: account.id,
        marketId,
        side,
        orderType,
        err: error,
      },
      "Order creation failed; transaction rolled back",
    );

    throw error;
  } finally {
    client.release();
  }
};

const cancelOrder = async ({ orderId, userId, requestId }) => {
  const account = await accountRepository.getAccountByUserId({ userId });

  if (!account) {
    logger.warn(
      {
        requestId,
        userId,
        orderId,
      },
      "Order cancellation rejected: account not found",
    );

    const error = new Error("Account not found");
    error.statusCode = 404;
    throw error;
  }

  if (account.account_status !== "ACTIVE") {
    logger.warn(
      {
        requestId,
        userId,
        orderId,
      },
      "Order cancellation Rejected:Account is not active",
    );

    const error = new Error("Account is not active");
    error.statusCode = 404;
    throw error;
  }

  const client = await pool.connect();

  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const order = await orderRepository.getOrderForUpdate({ orderId, client });
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    if (order.account_id !== account.id) {
      const error = new Error("You are not allowed to cancel this order");
      error.statusCode = 403;
      throw error;
    }

    if (!["NEW", "PARTIALLY_FILLED"].includes(order.status)) {
      const error = new Error(
        `Order cannot be cancelled from status ${order.status}`,
      );
      error.statusCode = 409;
      throw error;
    }

    const market = await marketRepository.getMarketById({
      marketId: order.market_id,
    });

    if (!market) {
      const error = new Error("Market not found");
      error.statusCode = 404;
      throw error;
    }

    const balanceAssetId =
      order.side === "BUY" ? market.quote_asset_id : market.base_asset_id;

    const releaseAmount =
      order.side === "BUY"
        ? await client
            .query(
              `
                SELECT
                  $1::NUMERIC * $2::NUMERIC AS release_amount
              `,
              [order.remaining_quantity, order.price],
            )
            .then((result) => result.rows[0].release_amount)
        : order.remaining_quantity;

    logger.info(
      {
        requestId,
        userId,
        accountId: account.id,
        orderId,
        side: order.side,
        remainingQuantity: order.remaining_quantity,
        balanceAssetId,
        releaseAmount,
      },
      "Calculated order cancellation balance release",
    );

    const cancelledOrder = await orderRepository.cancelOrderWithClient({
      client,
      orderId,
    });

    if (!cancelledOrder) {
      const error = new Error("Order could not be cancelled");
      error.statusCode = 409;
      throw error;
    }

    const unlockedBalance = await balanceRepository.unlockBalance({
      accountId: account.id,
      assetId: balanceAssetId,
      amount: releaseAmount,
      client,
    });

    if (!unlockedBalance) {
      const error = new Error("Unable to unlock order balance");
      error.statusCode = 409;
      throw error;
    }

    await client.query("COMMIT");
    transactionStarted = false;

    logger.info(
      {
        requestId,
        userId,
        accountId: account.id,
        orderId,
        side: order.side,
        releaseAmount,
        balanceAssetId,
        status: cancelledOrder.status,
      },
      "Order cancelled successfully",
    );

    return cancelledOrder;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        logger.error(
          { requestId, orderId, err: rollbackError },
          "Order cancellation rollback failed",
        );
      }
    }

    logger.error(
      {
        requestId,
        userId,
        orderId,
        err: error,
      },
      "Order cancellation failed; transaction rolled back",
    );

    throw error;
  } finally {
    client.release();
  }
};

const getOrderById = async ({ orderId, requestId }) => {
  const order = await orderRepository.getOrderById({ orderId });

  if (!order) {
    logger.warn({ requestId, orderId }, "Order not found");

    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  return order;
};

const getOrdersByAccountId = async ({ accountId, requestId }) => {
  const account = await accountRepository.getAccountById({ accountId });

  if (!account) {
    logger.warn({ requestId, accountId }, "Account not found");

    const error = new Error("Account not found");
    error.statusCode = 404;
    throw error;
  }

  const orders = await orderRepository.getOrdersByAccountId({ accountId });

  logger.info(
    { requestId, accountId, orderCount: orders.length },
    "Account orders fetched successfully",
  );

  return orders;
};

const getAllOrders = async ({ requestId }) => {
  logger.info({ requestId }, "Fetching all orders");

  const orders = await orderRepository.getAllOrders();

  logger.info(
    {
      requestId,
      orderCount: orders.length,
    },
    "Orders fetched successfully",
  );

  return orders;
};

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByAccountId,
  getAllOrders,
  cancelOrder,
};

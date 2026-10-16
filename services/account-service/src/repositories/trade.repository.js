const createTradeWithClient = async ({
  client,
  marketId,
  buyOrderId,
  sellOrderId,
  price,
  quantity,
}) => {
  const query = `INSERT INTO public.trades(market_id,buy_order_id,sell_order_id,price,quantity) VALUES ($1,$2,$3,$4,$5) RETURNING *`;

  const result = await client.query(query, [
    marketId,
    buyOrderId,
    sellOrderId,
    price,
    quantity,
  ]);
  return result.rows[0];
};

module.exports = { createTradeWithClient };

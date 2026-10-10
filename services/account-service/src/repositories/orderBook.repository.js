const pool = require("../config/db");

const getOrderBookOrders = async ({ marketId, side, limit = 50 }) => {
  const query = `SELECT id, market_id, side, price, remaining_quantity, created_at
  FROM public.orders 
  WHERE market_id =$1 
  AND status IN ('NEW','PARTIALLY_FILLED') 
  AND side =$2 
  ORDER BY  CASE WHEN $2='BUY' THEN price END DESC,
            CASE WHEN $2='SELL' THEN price END ASC,
  created_at ASC,
  id ASC
  LIMIT $3
  `;

  const result = await pool.query(query, [marketId, side, limit]);

  return result.rows;
};

module.exports = { getOrderBookOrders };

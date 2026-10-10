const pool = require("../config/db");

const createOrder = async ({
  accountId,
  marketId,
  clientOrderId,
  side,
  orderType,
  price,
  quantity,
}) => {
  const query = `INSERT INTO 
                 public.orders (account_id,market_id,client_order_id,side,order_type,price,quantity)
                 VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
  const result = await pool.query(query, [
    accountId,
    marketId,
    clientOrderId,
    side,
    orderType,
    price,
    quantity,
  ]);

  return result.rows[0];
};

const getOrderById = async ({ orderId }) => {
  const query = `SELECT * FROM public.orders  WHERE id =$1`;
  const result = await pool.query(query, [orderId]);
  return result.rows[0] || null;
};

const getOrderForUpdate = async ({ orderId, client }) => {
  const query = `SELECT * FROM public.orders  WHERE id =$1 FOR UPDATE`;
  const result = await client.query(query, [orderId]);
  return result.rows[0] || null;
};

const getOrdersByAccountId = async ({ accountId }) => {
  const query = ` SELECT * FROM public.orders WHERE account_id=$1`;
  const result = await pool.query(query, [accountId]);
  return result.rows;
};

const cancelOrderWithClient = async ({ client, orderId }) => {
  const query = `UPDATE public.orders 
  SET status ='CANCELLED',
   updated_at = NOW()
    WHERE id = $1 
    AND status IN ('NEW','PARTIALLY_FILLED')
    RETURNING *`;

  const result = await client.query(query, [orderId]);

  return result.rows[0] || null;
};

const createOrderWithClient = async ({
  accountId,
  marketId,
  clientOrderId,
  side,
  orderType,
  price,
  quantity,
  client,
}) => {
  const query = `INSERT INTO 
                 public.orders (account_id,market_id,client_order_id,side,order_type,price,quantity)
                 VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
  const result = await client.query(query, [
    accountId,
    marketId,
    clientOrderId,
    side,
    orderType,
    price,
    quantity,
  ]);

  return result.rows[0];
};

const getAllOrders = async () => {
  const query = `
    SELECT *
    FROM public.orders
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query);

  return result.rows;
};

module.exports = {
  getAllOrders,
  createOrder,
  getOrdersByAccountId,
  getOrderById,
  createOrderWithClient,
  cancelOrderWithClient,
  getOrderForUpdate
};

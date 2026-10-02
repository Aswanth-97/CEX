const pool = require("../config/db");

const createDeposit = async ({ accountId, assetId, amount, txHash }) => {
  const query = ` INSERT INTO public.deposits(account_id,asset_id,amount,tx_hash) VALUES($1,$2,$3,$4) RETURNING *`;

  const result = await pool.query(query, [accountId, assetId, amount, txHash]);

  return result.rows[0];
};

const getDepositById = async ({ depositId }) => {
  const query = `SELECT * from public.deposits WHERE id=$1`;

  const result = await pool.query(query, [depositId]);

  return result.rows[0];
};

const updateDepositStatus = async ({ depositId, status, client = pool }) => {
  const query = `UPDATE public.deposits SET  status=$1,updated_at=NOW() WHERE id=$2 RETURNING *`;

  const result = await client.query(query, [status, depositId]);

  return result.rows[0];
};

const getDepositForUpdate = async ({ depositId, client }) => {
  const query = `SELECT * FROM public.deposits WHERE id=$1 FOR UPDATE`;

  const result = await client.query(query, [depositId]);

  return result.rows[0];
};

module.exports = {
  getDepositById,
  createDeposit,
  updateDepositStatus,
  getDepositForUpdate,
};

const pool = require("../config/db");

const createWithdrawal = async ({
  accountId,
  assetId,
  destination,
  amount,
}) => {
  const query = ` INSERT INTO public.withdrawals (account_id,asset_id,amount,destination) VALUES ($1,$2,$3,$4) RETURNING *`;

  const result = await pool.query(query, [
    accountId,
    assetId,
    amount,
    destination,
  ]);

  return result.rows[0];
};

const getWithdrawalById = async ({ withdrawalId }) => {
  const query = `SELECT * FROM public.withdrawals WHERE id=$1`;

  const result = await pool.query(query, [withdrawalId]);

  return result.rows[0];
};

const updateWithdrawal = async ({
  withdrawalId,
  status,
  txHash = null,
  client = pool,
}) => {
  const query = `UPDATE public.withdrawals SET  status=$1,tx_hash=$2,updated_at=NOW() WHERE id=$3 RETURNING *`;

  const result = await client.query(query, [status, txHash, withdrawalId]);

  return result.rows[0];
};

const getWithdrawalForUpdate = async ({ withdrawalId, client }) => {
  const query = `
    SELECT *
    FROM public.withdrawals
    WHERE id = $1
    FOR UPDATE
  `;

  const result = await client.query(query, [withdrawalId]);

  return result.rows[0];
};

module.exports = {
  createWithdrawal,
  getWithdrawalById,
  updateWithdrawal,
  getWithdrawalForUpdate,
};

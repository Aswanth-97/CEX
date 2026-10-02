const pool = require("../config/db");

const getBalancesByAccountId = async (accountId) => {
  const query = `
    SELECT
      ab.id,
      ab.account_id,
      ab.asset_id,
      a.symbol,
      a.name,
      a.asset_type,
      a.decimals,
      ab.available_balance,
      ab.locked_balance,
      ab.created_at,
      ab.updated_at
    FROM public.account_balances AS ab
    INNER JOIN public.assets AS a
      ON a.id = ab.asset_id
    WHERE ab.account_id = $1
    ORDER BY a.symbol ASC
  `;

  const result = await pool.query(query, [accountId]);

  return result.rows;
};

const creditBalance = async ({ accountId, assetId, amount, client = pool }) => {
  const query = ` INSERT INTO  public.account_balances (account_id,asset_id,available_balance) VALUES ($1,$2,$3) 
  ON CONFLICT (account_id,asset_id) DO UPDATE SET  available_balance = account_balances.available_balance + EXCLUDED.available_balance,updated_at=NOW() 
  RETURNING
      id,
      account_id,
      asset_id,
      available_balance,
      locked_balance,
      created_at,
      updated_at`;

  const result = await client.query(query, [accountId, assetId, amount]);

  return result.rows[0];
};

const debitBalance = async ({ accountId, assetId, amount }) => {
  const query = `UPDATE public.account_balances 
   SET  available_balance= available_balance-$3,
   updated_at = NOW() 
   WHERE account_id=$1 
   AND asset_id=$2 
   AND available_balance >= $3
   RETURNING * `;

  const result = await pool.query(query, [accountId, assetId, amount]);

  return result.rows[0];
};

const lockBalance = async ({ accountId, assetId, amount, client = pool }) => {
  const query = `UPDATE public.account_balances 
  SET locked_balance=locked_balance+$3,
  available_balance=available_balance-$3,
  updated_at=NOW()
  WHERE account_id=$1
  AND asset_id=$2
  AND available_balance>=$3
  RETURNING *`;

  const result = await client.query(query, [accountId, assetId, amount]);

  return result.rows[0];
};

const unlockBalance = async ({ accountId, assetId, amount,client=pool }) => {
  const query = `UPDATE public.account_balances 
  SET locked_balance=locked_balance-$3,
  available_balance=available_balance+$3,
  updated_at=NOW()
  WHERE account_id=$1
  AND asset_id=$2
  AND locked_balance>=$3
  RETURNING *`;

  const result = await client.query(query, [accountId, assetId, amount]);

  return result.rows[0];
};

const finalizeWithdrawalBalance = async ({
  accountId,
  assetId,
  amount,
  client = pool,
}) => {
  const query = `UPDATE public.account_balances
                 SET locked_balance=locked_balance-$1,
                 updated_at=NOW()
                 WHERE account_id=$2
                 AND asset_id=$3
                 and locked_balance>=$1
                 RETURNING *`;

  const result = await client.query(query, [amount, accountId, assetId]);

  return result.rows[0];
};

module.exports = {
  getBalancesByAccountId,
  creditBalance,
  debitBalance,
  lockBalance,
  unlockBalance,
  finalizeWithdrawalBalance,
};

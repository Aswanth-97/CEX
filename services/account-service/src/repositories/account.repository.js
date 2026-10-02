const pool = require("../config/db");

const getAccountById = async ({ accountId }) => {
  const query = `
    SELECT
      id,
      auth_user_id,
      user_name,
      account_status,
      kyc_status,
      created_at,
      updated_at
    FROM public.accounts
    WHERE id = $1
  `;

  const result = await pool.query(query, [accountId]);

  return result.rows[0];
};

module.exports = { getAccountById };

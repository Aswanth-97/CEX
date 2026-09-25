const pool = require("../config/db");

const getAllAssets = async () => {
  const result = await pool.query(
    `SELECT * FROM public.assets ORDER BY symbol ASC`,
  );

  return result.rows;
};







module.exports = { getAllAssets };

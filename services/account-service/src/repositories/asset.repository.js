const pool = require("../config/db");

const getAllAssets = async ({ assetType, status }) => {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`status=$${values.length}`);
  }

  if (assetType) {
    values.push(assetType);
    conditions.push(`asset_type=$${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE  ${conditions.join(" AND ")}`
    : "";

  const result = await pool.query(
    `SELECT * FROM public.assets ${whereClause}  ORDER BY symbol ASC`,
    values,
  );

  return result.rows;
};

const getAssetById = async ({ assetId }) => {
  const result = await pool.query(`SELECT * FROM public.assets WHERE id=$1`, [
    assetId,
  ]);

  return result.rows[0];
};

const createAsset = async ({ symbol, name, assetType, decimals, status }) => {
  const query = `INSERT INTO public.assets (symbol,asset_type,decimals,status,name) VALUES($1,$2,$3,$4,$5) RETURNING *`;
  const result = await pool.query(query, [
    symbol,
    assetType,
    decimals,
    status,
    name,
  ]);

  return result.rows[0];
};

const updateAsset = async ({ name, status, assetId }) => {
  const query = `UPDATE  public.assets  
  SET name=COALESCE($1,name),status=COALESCE($2,status),
  updated_at=NOW() 
  WHERE id=$3  
  RETURNING * `;

  const updated = await pool.query(query, [name, status, assetId]);

  return updated.rows[0];
};

module.exports = { getAllAssets, getAssetById, createAsset, updateAsset };

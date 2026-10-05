const pool = require("../config/db");

const getAllAssetNetworks = async ({ assetId, status } = {}) => {
  const conditions = [];
  const values = [];

  if (assetId) {
    values.push(assetId);
    conditions.push(`asset_id=$${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status=$${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await pool.query(
    `SELECT * FROM public.asset_networks  ${whereClause} ORDER BY network_name ASC`,
    values,
  );

  return result.rows;
};

const getAssetNetworkById = async ({ assetNetworkId }) => {
  const result = await pool.query(
    `SELECT * FROM public.asset_networks WHERE id =$1`,
    [assetNetworkId],
  );

  return result.rows[0];
};
const createAssetNetwork = async ({
  assetId,
  network,
  networkName,
  status,
}) => {
  const query = `INSERT INTO public.asset_networks (asset_id,network,network_name,status) VALUES ($1,$2,$3,$4) RETURNING *`;

  const result = await pool.query(query, [
    assetId,
    network,
    networkName,
    status,
  ]);

  return result.rows[0];
};

const updateAssetNetwork = async ({ assetNetworkId, networkName, status }) => {
  const query = `UPDATE public.asset_networks
                SET 
                network_name=COALESCE($1,network_name), 
                status=COALESCE($2,status),
                updated_at=NOW()
                WHERE id = $3
                RETURNING *`;
  const result = await pool.query(query, [networkName, status, assetNetworkId]);

  return result.rows[0];
};

module.exports = {
  getAllAssetNetworks,
  getAssetNetworkById,
  createAssetNetwork,
  updateAssetNetwork,
};

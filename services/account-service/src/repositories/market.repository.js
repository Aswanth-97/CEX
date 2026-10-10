const pool = require("../config/db");

const getAllMarkets = async () => {
  const query = ` SELECT 
      m.id,m.symbol,m.base_asset_id, 
      m.quote_asset_id,
      base.symbol AS base_asset,
      quote.symbol AS quote_asset,
      m.status,
      m.price_precision,
      m.quantity_precision,
      m.min_quantity,
      m.min_notional,
      m.created_at,
      m.updated_at
      FROM 
      public.markets m  JOIN public.assets base
      ON m.base_asset_id=base.id
      JOIN public.assets quote
      ON m.quote_asset_id =quote.id
      ORDER BY m.symbol
      `;

  const result = await pool.query(query);

  return result.rows;
};
const getMarketById = async ({ marketId }) => {
  const result = await pool.query(
    `
      SELECT
        m.id,
        m.symbol,
        m.base_asset_id,
        base.symbol AS base_asset,
        base.decimals AS base_asset_decimals,
        m.quote_asset_id,
        quote.symbol AS quote_asset,
        quote.decimals AS quote_asset_decimals,
        m.status,
        m.price_precision,
        m.quantity_precision,
        m.min_quantity,
        m.min_notional,
        m.created_at,
        m.updated_at
      FROM public.markets m
      JOIN public.assets base
        ON base.id = m.base_asset_id
      JOIN public.assets quote
        ON quote.id = m.quote_asset_id
      WHERE m.id = $1
    `,
    [marketId],
  );

  return result.rows[0] || null;
};
const getMarketBySymbol = async ({ symbol }) => {
  const result = await pool.query(
    `
      SELECT
        m.id,
        m.symbol,
        m.base_asset_id,
        base.symbol AS base_asset,
        m.quote_asset_id,
        quote.symbol AS quote_asset,
        m.status,
        m.price_precision,
        m.quantity_precision,
        m.min_quantity,
        m.min_notional,
        m.created_at,
        m.updated_at
      FROM public.markets m
      JOIN public.assets base
        ON base.id = m.base_asset_id
      JOIN public.assets quote
        ON quote.id = m.quote_asset_id
      WHERE m.symbol = $1
    `,
    [symbol],
  );

  return result.rows[0] || null;
};

const createMarket = async ({
  symbol,
  baseAssetId,
  quoteAssetId,
  status,
  pricePrecision,
  quantityPrecision,
  minQuantity,
  minNotional,
}) => {
  const query = ` INSERT INTO 
                  public.markets
                  (symbol,base_asset_id,quote_asset_id,status,price_precision,
                  quantity_precision,min_quantity,min_notional) 
                  VALUES($1,$2,$3,$4,$5,$6,$7,$8)  RETURNING *`;

  const result = await pool.query(query, [
    symbol,
    baseAssetId,
    quoteAssetId,
    status,
    pricePrecision,
    quantityPrecision,
    minQuantity,
    minNotional,
  ]);

  return result.rows[0];
};

module.exports = {
  getAllMarkets,
  getMarketById,
  getMarketBySymbol,
  createMarket,
};

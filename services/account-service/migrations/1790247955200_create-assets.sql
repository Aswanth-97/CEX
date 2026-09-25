-- Up Migration

CREATE TABLE public.assets(
  id uuid PRIMARY KEY  DEFAULT gen_random_uuid(),
  symbol VARCHAR(20) NOT NULL,
  asset_type VARCHAR(20) NOT NULL  CHECK (asset_type IN ('CRYPTO','FIAT')),
  decimals SMALLINT NOT NULL  CHECK (decimals >=0 AND decimals <= 18),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','DELISTED')), 
  created_at TIMESTAMPTZ NOT NULL DEFAULT  NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT assets_symbol_unique  UNIQUE (symbol)

);



-- Down Migration

DROP TABLE public.assets
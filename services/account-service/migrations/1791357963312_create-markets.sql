-- Up Migration
CREATE TABLE public.markets(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  symbol VARCHAR(30) NOT NULL ,

  base_asset_id  uuid NOT NULL,

  quote_asset_id uuid NOT NULL,

  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

  price_precision SMALLINT NOT NULL ,

  quantity_precision SMALLINT NOT NULL,

  min_quantity NUMERIC  NOT NULL,

  min_notional NUMERIC NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT markets_symbol_unique 
    UNIQUE (symbol),

  CONSTRAINT markets_base_quote_unique 
    UNIQUE (base_asset_id,quote_asset_id),

  CONSTRAINT markets_base_quote_different 
    CHECK(base_asset_id<>quote_asset_id),

  CONSTRAINT markets_status_check 
    CHECK (status IN ('ACTIVE','SUSPENDED','DELISTED')),

  CONSTRAINT markets_price_precision_check
      CHECK (price_precision >= 0 AND price_precision <= 18),

  CONSTRAINT markets_quantity_precision_check
      CHECK (quantity_precision >= 0 AND quantity_precision <= 18),

  CONSTRAINT markets_min_quantity_check
      CHECK (min_quantity > 0),

  CONSTRAINT markets_min_notional_check
      CHECK (min_notional > 0),

  CONSTRAINT markets_base_asset_fkey
      FOREIGN KEY (base_asset_id)
      REFERENCES public.assets(id)
      ON DELETE RESTRICT,

  CONSTRAINT markets_quote_asset_fkey
      FOREIGN KEY (quote_asset_id)
      REFERENCES public.assets(id)
      ON DELETE RESTRICT

);
CREATE INDEX idx_markets_base_asset_id
    ON public.markets(base_asset_id);

CREATE INDEX idx_markets_quote_asset_id
    ON public.markets(quote_asset_id);

-- Down Migration

DROP TABLE public.markets
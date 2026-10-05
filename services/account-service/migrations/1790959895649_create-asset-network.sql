-- Up Migration

CREATE TABLE public.asset_networks(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL ,
  network VARCHAR(30) NOT NULL,
  network_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
  CHECK (status IN ('ACTIVE','SUSPENDED','DELISTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT asset_network_asset_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE RESTRICT,
  CONSTRAINT asset_networks_asset_network_unique UNIQUE(asset_id,network)
);

CREATE INDEX idx_asset_networks_asset_id
  ON public.asset_networks(asset_id);


-- Down Migration 


DROP TABLE public.asset_networks;
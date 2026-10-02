-- Up Migration

CREATE TABLE  public.deposits(
  id uuid  PRIMARY KEY  NOT NULL DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL ,
  asset_id uuid NOT NULL,
  amount NUMERIC(30,18) NOT NULL,
  tx_hash VARCHAR(256) NOT NULL,
  status VARCHAR(26) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT deposits_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id),
  CONSTRAINT deposits_asset_id_fkey  FOREIGN KEY (asset_id) REFERENCES public.assets(id),
  CONSTRAINT deposits_amount_check CHECK (amount>0),
  CONSTRAINT deposits_status_check CHECK (status IN ('PENDING','CONFIRMED','CREDITED','FAILED')),
  CONSTRAINT deposits_tx_hash_key UNIQUE (tx_hash)


);

-- Down Migration

DROP TABLE public.deposits;
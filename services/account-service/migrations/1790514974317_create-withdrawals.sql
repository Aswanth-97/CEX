-- Up Migration
CREATE TABLE public.withdrawals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  account_id uuid  NOT NULL ,
  asset_id uuid NOT NULL,
  amount NUMERIC(30,18) NOT NULL,
  destination VARCHAR(256) NOT NULL,
  tx_hash VARCHAR(256) ,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT withdrawals_amount_check CHECK(amount>0),
  CONSTRAINT withdrawals_tx_hash_key UNIQUE(tx_hash),
  CONSTRAINT withdrawals_status_check CHECK( status IN ('PENDING','PROCESSING',
        'BROADCAST',
        'COMPLETED',
        'FAILED'))
);

-- Down Migration

DROP TABLE public.withdrawals;
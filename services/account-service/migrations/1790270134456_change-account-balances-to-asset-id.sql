-- Up Migration
ALTER TABLE public.account_balances
DROP CONSTRAINT account_balances_account_asset_key;

ALTER TABLE public.account_balances
DROP COLUMN asset;

ALTER TABLE public.account_balances
ADD COLUMN asset_id UUID NOT NULL;

ALTER TABLE public.account_balances
ADD CONSTRAINT account_balances_asset_id_fkey
    FOREIGN KEY (asset_id)
    REFERENCES public.assets(id);

ALTER TABLE public.account_balances
ADD CONSTRAINT account_balances_account_asset_key
    UNIQUE (account_id, asset_id);

ALTER TABLE public.account_balances
ADD CONSTRAINT account_balances_available_balance_check
    CHECK (available_balance >= 0);

ALTER TABLE public.account_balances
ADD CONSTRAINT account_balances_locked_balance_check
    CHECK (locked_balance >= 0);

-- Down Migration


ALTER TABLE public.account_balances
DROP CONSTRAINT account_balances_available_balance_check;

ALTER TABLE public.account_balances
DROP CONSTRAINT account_balances_locked_balance_check;

ALTER TABLE public.account_balances
DROP CONSTRAINT account_balances_account_asset_key;

ALTER TABLE public.account_balances
DROP CONSTRAINT account_balances_asset_id_fkey;

ALTER TABLE public.account_balances
DROP COLUMN asset_id;

ALTER TABLE public.account_balances
ADD COLUMN asset VARCHAR(20) NOT NULL;

ALTER TABLE public.account_balances
ADD CONSTRAINT account_balances_account_asset_key
    UNIQUE (account_id, asset);
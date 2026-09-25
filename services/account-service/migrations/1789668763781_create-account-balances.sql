-- Up Migration

CREATE TABLE public.account_balances (
    id UUID NOT NULL DEFAULT gen_random_uuid(),

    account_id UUID NOT NULL,

    asset VARCHAR(20) NOT NULL,

    available_balance NUMERIC(30, 18) NOT NULL DEFAULT 0,

    locked_balance NUMERIC(30, 18) NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT now(),

    updated_at TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT account_balances_pkey
        PRIMARY KEY (id),

    CONSTRAINT account_balances_account_id_fkey
        FOREIGN KEY (account_id)
        REFERENCES public.accounts(id),

    CONSTRAINT account_balances_account_asset_key
        UNIQUE (account_id, asset)
);


-- Down Migration

DROP TABLE public.account_balances;
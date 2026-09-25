-- Up Migration
CREATE TABLE public.accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    kyc_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT accounts_pkey PRIMARY KEY (id),

    CONSTRAINT auth_user_id UNIQUE (auth_user_id),

    CONSTRAINT user_name UNIQUE (user_name),

    CONSTRAINT accounts_account_status_check
        CHECK (
            account_status IN (
                'ACTIVE',
                'SUSPENDED',
                'RESTRICTED',
                'CLOSED'
            )
        ),

    CONSTRAINT accounts_kyc_status_check
        CHECK (
            kyc_status IN (
                'PENDING',
                'VERIFIED',
                'REJECTED',
                'EXPIRED'
            )
        )
);


-- Down Migration

DROP TABLE public.accounts;
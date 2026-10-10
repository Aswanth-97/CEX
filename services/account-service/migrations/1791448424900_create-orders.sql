    -- Up Migration

    CREATE TABLE public.orders (
    id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    account_id uuid NOT NULL,
    market_id uuid NOT NULL,
    client_order_id  VARCHAR(40),
    side VARCHAR(10) NOT NULL,
    order_type VARCHAR(20) NOT NULL DEFAULT 'LIMIT',
    price NUMERIC(30,18) NOT NULL,
    quantity NUMERIC(30,18) NOT NULL,
    filled_quantity NUMERIC(30,18) NOT NULL DEFAULT 0,
    remaining_quantity NUMERIC(30,18) GENERATED ALWAYS AS (quantity-filled_quantity) STORED,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT orders_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE RESTRICT,

    CONSTRAINT orders_market_id_fkey FOREIGN key (market_id) REFERENCES public.markets(id) ON DELETE RESTRICT,

    CONSTRAINT order_side_check CHECK (side IN ('BUY','SELL')),

    CONSTRAINT market_order_type_check CHECK (order_type IN ('LIMIT')),

    CONSTRAINT order_status_check  CHECK (status IN ('NEW','PARTIALLY_FILLED','FILLED','CANCELLED','REJECTED')),

    CONSTRAINT order_price_check CHECK (price > 0),

    CONSTRAINT order_quantity_check CHECK (quantity > 0),

    CONSTRAINT orders_filled_quantity_check CHECK (filled_quantity>=0 AND filled_quantity <=quantity) ,

    CONSTRAINT orders_account_client_order_id_unique UNIQUE(account_id,client_order_id)

    );

    CREATE INDEX idx_orders_account_id ON public.orders(account_id);

    CREATE INDEX idx_orders_market_id ON public.orders(market_id);

    CREATE INDEX idx_orders_market_active
        ON public.orders(
            market_id,
            side,
            price,
            created_at
        )
        WHERE status IN ('NEW', 'PARTIALLY_FILLED');



    -- Down Migration

    DROP TABLE public.orders;
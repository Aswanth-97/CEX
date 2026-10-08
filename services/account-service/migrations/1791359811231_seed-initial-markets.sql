-- Up Migration

INSERT INTO public.markets (
    symbol,
    base_asset_id,
    quote_asset_id,
    status,
    price_precision,
    quantity_precision,
    min_quantity,
    min_notional
)
VALUES
(
    'BTC/USDT',
    '3f9ffa45-5ecb-4103-a692-487b42c8ab03',
    '905cce45-c34a-4577-8726-67d01f46f15a',
    'ACTIVE',
    2,
    8,
    0.00001,
    10
),
(
    'ETH/USDT',
    'ce091dc7-7dd6-4559-b26a-76db56fd7202',
    '905cce45-c34a-4577-8726-67d01f46f15a',
    'ACTIVE',
    2,
    6,
    0.0001,
    10
),
(
    'SOL/USDT',
    '3d4fc52c-a55c-4575-a6f9-e26ba075e119',
    '905cce45-c34a-4577-8726-67d01f46f15a',
    'SUSPENDED',
    3,
    4,
    0.01,
    10
);

-- Down Migration


DELETE FROM public.markets
WHERE symbol IN (
    'BTC/USDT',
    'ETH/USDT',
    'SOL/USDT'
);
-- Up Migration

INSERT INTO public.asset_networks
  (asset_id, network, network_name, status)
VALUES

  (
    '3f9ffa45-5ecb-4103-a692-487b42c8ab03',
    'bitcoin',
    'Bitcoin',
    'ACTIVE'
  ),

  (
    'ce091dc7-7dd6-4559-b26a-76db56fd7202',
    'ethereum',
    'Ethereum',
    'ACTIVE'
  ),

  (
    '905cce45-c34a-4577-8726-67d01f46f15a',
    'tron',
    'TRON',
    'ACTIVE'
  ),

  (
    '905cce45-c34a-4577-8726-67d01f46f15a',
    'bsc',
    'BNB Smart Chain',
    'ACTIVE'
  ),

  (
    '3d4fc52c-a55c-4575-a6f9-e26ba075e119',
    'solana',
    'Solana',
    'ACTIVE'
  );  

-- Down Migration

DELETE FROM public.asset_networks
WHERE (asset_id, network) IN (
  ('3f9ffa45-5ecb-4103-a692-487b42c8ab03', 'bitcoin'),
  ('ce091dc7-7dd6-4559-b26a-76db56fd7202', 'ethereum'),
  ('905cce45-c34a-4577-8726-67d01f46f15a', 'tron'),
  ('905cce45-c34a-4577-8726-67d01f46f15a', 'bsc'),
  ('3d4fc52c-a55c-4575-a6f9-e26ba075e119', 'solana')
)
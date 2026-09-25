-- Up Migration

INSERT INTO public.assets(symbol,name,asset_type,decimals,status) VALUES
('BTC','Bitcoin','CRYPTO',8,'ACTIVE'),
('ETH','Ethereum','CRYPTO',18,'ACTIVE'),
('USDT','Tether USD','CRYPTO',6,'ACTIVE') ON CONFLICT (symbol) DO NOTHING

-- Down Migration


DELETE FROM public.assets
WHERE symbol IN ('BTC', 'ETH', 'USDT');
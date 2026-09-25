-- Up Migration
ALTER TABLE public.assets
ADD COLUMN name VARCHAR(100);

-- Down Migration

ALTER TABLE public.assets
DROP COLUMN name;
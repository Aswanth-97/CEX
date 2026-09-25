-- Up Migration
ALTER TABLE public.assets
ALTER COLUMN name SET NOT NULL;

-- Down Migration


ALTER TABLE public.assets
ALTER COLUMN name DROP NOT NULL;
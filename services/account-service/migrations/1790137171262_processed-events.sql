-- Up Migration
CREATE TABLE public.processed_events(
  event_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  processed_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT processed_events_pkey PRIMARY KEY (event_id)
)

-- Down Migration

DROP TABLE public.processed_events;
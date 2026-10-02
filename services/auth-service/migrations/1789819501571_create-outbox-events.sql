-- Up Migration

CREATE TABLE public.outbox_events(
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,
  aggregate_id BIGINT NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,

  CONSTRAINT outbox_events_pkey
      PRIMARY KEY (id)
)






-- Down Migration

DROP TABLE public.outbox_events;s
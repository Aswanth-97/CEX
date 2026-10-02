-- Up Migration
CREATE TABLE public.roles(
  id uuid NOT NULL DEFAULT gen_random_uuid(),

  role VARCHAR(50) NOT NULL ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT roles_pkay  PRIMARY KEY (id),

  CONSTRAINT roles_name_key UNIQUE (role)
);

INSERT INTO public.roles(role) VALUES ('USER'),('ADMIN'),('SUPPORT'),('COMPLIANCE');

-- Down Migration

DROP TABLE public.roles;
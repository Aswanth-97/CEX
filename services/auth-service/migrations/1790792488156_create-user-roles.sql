-- Up Migration

CREATE TABLE public.user_roles(
  id uuid NOT NULL DEFAULT gen_random_uuid(),

  user_id  BIGINT  NOT NULL ,

  role_id uuid NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT user_roles_pkey PRIMARY KEY (id),

  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY(user_id) REFERENCES public.users(id)  ON DELETE CASCADE ,

  CONSTRAINT user_roles_roles_id FOREIGN KEY(role_id) REFERENCES public.roles(id)  ON DELETE CASCADE,

  CONSTRAINT user_roles_user_role_key UNIQUE (user_id,role_id)

);


-- Down Migration

DROP TABLE public.user_roles;
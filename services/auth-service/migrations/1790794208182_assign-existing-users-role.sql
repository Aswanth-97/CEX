-- Up Migration

INSERT INTO public.user_roles (user_id, role_id)
SELECT
  u.id,
  r.id
FROM public.users u
CROSS JOIN public.roles r
WHERE r.role = 'USER'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Down Migration

DELETE FROM public.user_roles ur
USING public.roles r
WHERE ur.role_id = r.id
  AND r.role = 'USER';
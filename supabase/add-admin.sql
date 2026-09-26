-- Após criar o usuário no Dashboard > Authentication > Users, informe aqui o e-mail dele.
insert into public.admin_users (id)
select id from auth.users where email = ''
on conflict (id) do nothing;
insert into public.admin_users (id)
select id from auth.users where email = ''
on conflict (id) do nothing;


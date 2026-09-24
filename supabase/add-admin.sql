-- Após criar o usuário no Dashboard > Authentication > Users, informe aqui o e-mail dele.
-- Execute outra vez para cada sócio. Não coloque senha neste arquivo.
insert into public.admin_users (id)
select id from auth.users where email = 'vitor.he2016@gmail.com'
on conflict (id) do nothing;
insert into public.admin_users (id)
select id from auth.users where email = 'leo.lemos@outlook.com'
on conflict (id) do nothing;
-- Se nenhuma linha for inserida, revise se o usuário já foi criado com esse e-mail.

-- Execute uma vez no SQL Editor do projeto Supabase.
-- A página pública lê somente; apenas IDs cadastrados em admin_users alteram conteúdo.
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.site_content (
  id integer primary key check (id = 1),
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.site_content enable row level security;

revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.site_content from anon, authenticated;
grant select on table public.admin_users to authenticated;
grant select on table public.site_content to anon, authenticated;
grant update (data) on table public.site_content to authenticated;

create policy "admin sees own membership" on public.admin_users
  for select to authenticated using (id = (select auth.uid()));
create policy "everyone sees published content" on public.site_content
  for select to anon, authenticated using (id = 1);
create policy "only approved admins update" on public.site_content
  for update to authenticated
  using (id = 1 and exists (select 1 from public.admin_users where id = (select auth.uid())))
  with check (id = 1 and exists (select 1 from public.admin_users where id = (select auth.uid())));

-- Public bucket for site imagery. Restrict formats and upload size on the server.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('site-images','site-images',true,3145728,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=3145728,
  allowed_mime_types=array['image/jpeg','image/png','image/webp'];
create policy "approved admins upload images" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'site-images' and exists
    (select 1 from public.admin_users where id = (select auth.uid()))
  );

-- O conteúdo original é inserido abaixo. Não há credenciais no arquivo.
insert into public.site_content (id,data) values (1, '{"hero": {"eyebrow": "Soluções digitais que geram resultados", "title": "Criamos sites que conectam sua empresa ao digital.", "lead": "Desenvolvemos sites modernos, rápidos e responsivos para fortalecer a presença digital do seu negócio.", "button": "Solicitar orçamento ↗"}, "headings": {"tech": "Tecnologias e ferramentas", "tech_note": "Tecnologias que utilizamos no desenvolvimento dos projetos. Não representam parcerias comerciais.", "solutions": "Soluções completas para o seu negócio.", "solutions_lead": "Da criação de sites à implementação de soluções digitais, desenvolvemos experiências pensadas para conectar empresas aos seus clientes.", "projects": "Conheça alguns dos nossos projetos.", "projects_lead": "Explore conceitos de sites desenvolvidos pela DSB Company para demonstrar nossa abordagem em design, tecnologia e experiência digital.", "about": "Tecnologia com propósito.", "process": "Um processo claro, do primeiro contato à entrega.", "cta": "Vamos tirar seu projeto do papel?", "cta_lead": "Conte-nos sobre sua ideia e descubra como podemos criar um site profissional para o seu negócio.", "cta_button": "Falar com a DSB"}, "about": {"paragraph1": "A DSB Company nasceu da união de dois sócios apaixonados por tecnologia, desenvolvimento web e criação de soluções digitais para empresas.", "paragraph2": "Nosso foco é desenvolver sites profissionais e landing pages que valorizem cada negócio. Trabalhamos com atenção aos detalhes, comunicação próxima e soluções pensadas para as necessidades de cada cliente."}, "tech": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Git", "Figma", "Google Analytics"], "services": [{"title": "Sites institucionais", "description": "Sites profissionais para apresentar sua empresa, seus serviços e seus canais de contato."}, {"title": "Landing pages", "description": "Páginas focadas em divulgar produtos, serviços ou campanhas e incentivar o contato."}, {"title": "Sites responsivos", "description": "Experiências adaptadas para celulares, tablets e computadores, com navegação intuitiva."}, {"title": "Manutenção de sites", "description": "Atualizações de conteúdo, ajustes visuais e suporte técnico conforme o plano contratado."}], "projects": [{"badge": "Projeto conceito", "category": "Site institucional · Estética", "title": "Auréa Estética", "description": "Site institucional para clínica de estética, com apresentação de serviços e contato pelo WhatsApp.", "image": "images/projects/aurea-estetica.webp", "url": "https://aureaestetica.vercel.app/"}, {"badge": "Projeto conceito", "category": "Experiência digital · Educação", "title": "Setor Oito", "description": "Plataforma educacional com apresentação de cursos e área dedicada aos alunos.", "image": "images/projects/setor-08.webp", "url": "https://setor-oito.netlify.app/"}, {"badge": "Projeto conceito", "category": "Site institucional · Saúde", "title": "Instituto Lipinski", "description": "Conceito de site institucional para clínica oftalmológica, com foco em informações e navegação acessível.", "image": "images/projects/instituto-lipinski.webp", "url": "https://prismatic-pony-e52cb6.netlify.app/"}], "partners": [{"name": "Vitor Henrique", "role": "Desenvolvimento Web & Tecnologia", "photo": "images/logo/socio-01.webp", "linkedin": ""}, {"name": "Leonardo Gonçalves", "role": "Estratégia & Relacionamento", "photo": "images/logo/socio-02.jpeg", "linkedin": ""}], "process": [{"title": "Entendimento", "description": "Conversamos sobre seu negócio, seus objetivos e o que você precisa para o projeto."}, {"title": "Planejamento", "description": "Definimos a estrutura, o visual e as funcionalidades do seu site."}, {"title": "Desenvolvimento", "description": "Construímos seu site e apresentamos uma versão para revisão e ajustes."}, {"title": "Entrega", "description": "Realizamos os testes finais e publicamos seu site após a aprovação."}], "contact": {"whatsapp": "5541998253143", "message": "Olá! Vim pelo site da DSB Company e gostaria de conversar sobre um projeto.", "instagram": "", "linkedin": ""}}'::jsonb) on conflict (id) do nothing;

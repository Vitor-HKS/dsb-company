# Painel de conteúdo da DSB Company

O site original continua visível enquanto o projeto Supabase não estiver conectado. **Não publique uma versão com o painel desconfigurado esperando que ele já funcione.** O banco ainda não foi criado nesta entrega.

## Ativação

1. Crie um projeto em sua conta no Supabase. Em **Authentication > Providers > Email**, desative a criação pública de contas (signups). Em **Authentication > Users**, crie uma conta de cada editor, com senha forte; use e-mails próprios.
2. No **SQL Editor**, execute o conteúdo de `supabase/install.sql`. Esse script cria as tabelas, os dados iniciais, o bucket de imagens e as regras de leitura e edição. Verifique que todas as instruções terminaram sem erro.
3. Abra `supabase/add-admin.sql`, substitua `SEU_EMAIL_AQUI` pelo e-mail da conta já criada e execute. Repita para o outro sócio se ele também precisar editar. O painel só aceita contas cadastradas nessa tabela.
4. Em **Project Settings > API Keys**, copie a **Project URL** e a chave **publishable**. Coloque-as em `js/cms-config.js`. Nunca use `secret`, `service_role` ou senha nesse arquivo. Para projetos antigos, a chave `anon` funciona no lugar da publishable.
5. Publique **o conteúdo da pasta que contém `index.html`** na Netlify. Entre em `/admin/` no domínio publicado. O painel não é protegido por segredo no endereço: as políticas no banco protegem a gravação.
6. Confirme as permissões: visite o site sem login; tente entrar com uma conta que não esteja em `admin_users` (deve ser bloqueada); entre com a conta autorizada, altere um texto e confira a atualização no site após recarregar. Teste o envio de uma imagem.

## O que o painel altera

Textos da abertura, seções, serviços, projetos, tecnologias, equipe, etapas, WhatsApp e links sociais. Permite incluir e remover cards dessas listas e enviar fotos/imagens para o bucket público. Os arquivos originais permanecem no ZIP como cópia. Mudanças de layout, código, estilos, logo, GTM e SEO ainda exigem edição dos arquivos. O título principal é texto simples no painel: ao editar, a palavra ou trecho colorido dentro dele deixa de ter destaque individual.

## Segurança e manutenção

- Configure **MFA na conta do Dashboard Supabase**. O painel desta versão usa e-mail e senha; não exige segundo fator no login do painel. Para exigir MFA também ali, é necessário adicionar o fluxo TOTP e restringir as políticas a sessões `aal2` antes de publicar essa exigência.
- As permissões RLS determinam quem edita. A chave publishable no navegador é pública por definição. **Jamais** publique uma chave secret/service_role.
- Cada salvamento substitui o objeto de conteúdo. Se dois editores salvarem ao mesmo tempo, vence o último; coordenem alterações. Guarde uma cópia do ZIP original e exportações periódicas do conteúdo.
- As imagens enviadas ficam públicas e usam nomes aleatórios. Remover o card não remove o arquivo antigo do bucket; faça limpeza periódica pelo Dashboard.
- Se uma consulta ao banco falhar, o site mostra o conteúdo original embutido no HTML. Antes de trocar textos do site de produção, confirme que o banco está funcionando.
- O GTM/GA4, telefone e links originais vieram do ZIP enviado. Revise antes de publicar.

Abra o site com servidor local (por exemplo, Live Server no VS Code); abrir o HTML diretamente por `file://` não é um teste de publicação.

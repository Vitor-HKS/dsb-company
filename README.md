# DSB Company — Site institucional

Site institucional/portfólio da **DSB Company | Digital Solutions for Business**.
Feito com HTML5, CSS3 e JavaScript puro, sem frameworks e sem etapa de build.

## Como executar

Abra o arquivo `index.html` no navegador (duplo clique). Não precisa de servidor.

Se preferir um servidor local (opcional):

```bash
# dentro da pasta do projeto
python3 -m http.server 8080
# depois acesse http://localhost:8080
```

> A única dependência externa é a fonte **Manrope** (Google Fonts), carregada no `<head>` do `index.html`.
> Sem internet, o navegador usa a fonte do sistema e o site continua funcionando.
> Não há bibliotecas JavaScript nem CSS de terceiros. Os ícones são SVG embutidos no HTML.

## Estrutura de arquivos

```
/
├── index.html            Página única (header, hero, tecnologias, soluções,
│                         projetos, sobre, processo, CTA e footer)
├── css/
│   └── style.css         Estilos (cores e medidas em variáveis no topo)
├── js/
│   └── script.js         Configurações (WhatsApp/redes), menu mobile e animações
├── images/
│   ├── logo/             logo.png, symbol.png, favicon.png, og-image.png (PLACEHOLDERS)
│   ├── projects/         Imagens dos projetos (SVGs ilustrativos, para substituir)
│   ├── team/             Fotos dos sócios (quando existirem)
│   └── icons/            Ícones extras, se necessário
└── README.md
```

## O que você precisa substituir

Tudo que é provisório está marcado com `SUBSTITUIR POR` nos comentários do código.

| O quê | Onde |
|---|---|
| **Logo** | Salve a logo oficial em `images/logo/logo.png` (mesmo nome, ela aparece no menu e no rodapé). A altura é controlada pelo CSS (`.brand img`), a proporção nunca é distorcida. |
| **Símbolo da logo** | Salve em `images/logo/symbol.png` (usado no centro da composição do hero) |
| **Favicon** | Salve o símbolo em `images/logo/favicon.png` (64×64 ou 128×128 px) |
| **Imagem de compartilhamento** | `images/logo/og-image.png` (1200×630 px). Ao publicar, use a URL absoluta na meta `og:image` do `index.html`. |

## Onde alterar cada informação

**WhatsApp** — `js/script.js`, no objeto `CONFIG.whatsapp`:
```js
number: "5500000000000",   // código do país + DDD + número, só dígitos
message: "Olá! Vim pelo site...",
```
Isso atualiza automaticamente o botão "Falar com a DSB" e o ícone do WhatsApp no rodapé.

**Redes sociais** — `js/script.js`, no objeto `CONFIG.social` (`instagram` e `linkedin`).
Enquanto o valor for `"#"`, o clique não faz nada.

**Cores da marca** — `css/style.css`, bloco `:root` no topo (`--color-primary`, `--color-secondary`, `--color-dark`, `--color-light` e derivadas).

**Sócios** — `index.html`, seção "Sobre nós" (`<div class="partners">`). Em cada `<article class="partner">` troque:
- nome (`<h3>`), função (`.partner-role`) e link do LinkedIn (`.partner-link`);
- a foto: salve em `images/team/` e troque o SVG de silhueta pelo `<img>` que está no comentário do bloco.

**Projetos** — `index.html`, seção `#projetos`.
Para adicionar um projeto, copie um bloco `<article class="project-card reveal">…</article>` e altere:
1. imagem (salve em `images/projects/`, proporção 16:10, ex.: 1200×750);
2. categoria, nome e descrição;
3. link do botão "Ver projeto" (enquanto for `#`, o botão não faz nada);
4. o selo "Projeto conceito": mantenha para projetos demonstrativos. Para projetos reais de clientes, troque o texto ou remova.

As imagens atuais dos projetos são ilustrações genéricas. Substitua por capturas de tela reais.

**Tecnologias** — `index.html`, lista `.tech-list`. São tecnologias usadas pela DSB, não parcerias comerciais (o texto da seção deixa isso claro).

## Notas de projeto

- Animações discretas: entrada do hero, linhas e pontos da composição do hero, cards aparecendo ao rolar e hovers. Tudo é desativado automaticamente para quem usa "reduzir movimento" no sistema.
- Acessibilidade: link "Ir para o conteúdo", foco visível, `aria-label` nos botões de ícone, menu mobile com `aria-expanded`, fechamento com `Esc` e ao clicar em um link.
- SEO: `title`, `meta description`, Open Graph, favicon e estrutura semântica (`header`, `nav`, `main`, `section`, `article`, `footer`).
- Ao publicar, considere adicionar `<link rel="canonical">` e a URL absoluta da imagem Open Graph.

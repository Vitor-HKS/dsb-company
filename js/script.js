/* ==========================================================================
   DSB Company — Digital Solutions for Business
   Scripts do site
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIGURAÇÕES — edite aqui WhatsApp e redes sociais
   -------------------------------------------------------------------------- */
const CONFIG = {
  whatsapp: {
    // SUBSTITUIR POR: número com código do país + DDD, somente dígitos (ex.: 5541999999999)
    number: "",
    // Mensagem que já aparece preenchida no WhatsApp
    message: "",
  },
  social: {
    // SUBSTITUIR POR: links reais. Enquanto estiver "#", o clique não faz nada.
    instagram: "#", // ex.: "https://www.instagram.com/seuperfil"
    linkedin: "#",  // ex.: "https://www.linkedin.com/company/seuperfil"
  },
};

/* --------------------------------------------------------------------------
   Links de contato (WhatsApp e redes sociais)
   -------------------------------------------------------------------------- */
function applyContactLinks() {
  const { number, message } = CONFIG.whatsapp;
  const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    el.setAttribute("href", whatsappUrl);
  });

  document.querySelectorAll("[data-social]").forEach((el) => {
    const url = CONFIG.social[el.dataset.social];
    if (url) el.setAttribute("href", url);
  });

  // Links ainda sem destino (href="#") não devem rolar a página para o topo
  document.querySelectorAll('a[href="#"]').forEach((el) => {
    el.addEventListener("click", (event) => event.preventDefault());
  });
}

/* --------------------------------------------------------------------------
   Header: menu mobile
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("menu");
  if (!header || !toggle || !menu) return;

  // Mesmo ponto de quebra do CSS (menu hambúrguer)
  const mobileQuery = window.matchMedia("(max-width: 1180px)");

  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }

  // Menu mobile fechado por padrão: esconde dos leitores de tela enquanto está fora da tela
  function syncMenuVisibility() {
    if (mobileQuery.matches) {
      if (!menu.classList.contains("is-open")) menu.setAttribute("inert", "");
    } else {
      menu.removeAttribute("inert");
      setMenu(false);
    }
  }
  syncMenuVisibility();
  mobileQuery.addEventListener("change", syncMenuVisibility);

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    if (open) menu.removeAttribute("inert");
    setMenu(open);
    if (!open) menu.setAttribute("inert", "");
  });

  // Fecha ao clicar em qualquer link do menu
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (!mobileQuery.matches) return;
      setMenu(false);
      menu.setAttribute("inert", "");
    });
  });

  // Fecha com Esc e devolve o foco ao botão
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setMenu(false);
      menu.setAttribute("inert", "");
      toggle.focus();
    }
  });
}

/* --------------------------------------------------------------------------
   Cards aparecem suavemente ao rolar
   -------------------------------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  // Pequeno atraso escalonado entre cards do mesmo grupo
  items.forEach((el) => {
    const index = Array.prototype.indexOf.call(el.parentElement.children, el);
    el.style.setProperty("--stagger", `${Math.min(index, 3) * 80}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Link ativo no menu conforme a seção visível
   -------------------------------------------------------------------------- */
function initActiveNav() {
  if (!("IntersectionObserver" in window)) return;

  const links = document.querySelectorAll(".nav-list .nav-link");
  const map = new Map();
  links.forEach((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) map.set(section, link);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => {
          l.classList.remove("is-active");
          l.removeAttribute("aria-current");
        });
        // Seções sem item no menu (ex.: tecnologias, processo) deixam todos os links sem destaque
        const active = map.get(entry.target);
        if (active) {
          active.classList.add("is-active");
          active.setAttribute("aria-current", "true");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  document.querySelectorAll("main > section[id]").forEach((section) => observer.observe(section));
}

/* -------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
   Desempenho do SVG da Home no celular
   Não altera layout, tamanho, cores nem animações quando a rolagem está parada.
   -------------------------------------------------------------------------- */
function initHeroPerformance() {
  const hero = document.querySelector('.hero');
  const graphic = hero?.querySelector('.hero-net');
  if (!hero || !graphic || !('IntersectionObserver' in window)) return;

  const mobileQuery = window.matchMedia('(max-width: 640px)');
  let heroVisible = true;
  let scrolling = false;
  let idleTimer;

  function syncAnimations() {
    graphic.classList.toggle('is-paused',
      mobileQuery.matches && (document.hidden || !heroVisible || scrolling)
    );
  }

  const observer = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    syncAnimations();
  }, { rootMargin: '80px 0px 80px 0px', threshold: 0 });
  observer.observe(hero);

  window.addEventListener('scroll', () => {
    if (!mobileQuery.matches || !heroVisible) return;
    if (!scrolling) { scrolling = true; syncAnimations(); }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { scrolling = false; syncAnimations(); }, 180);
  }, { passive: true });

  document.addEventListener('visibilitychange', syncAnimations);
  mobileQuery.addEventListener('change', syncAnimations);
}

document.addEventListener("DOMContentLoaded", () => {
  applyContactLinks();
  initHeader();
  initReveal();
  initHeroPerformance();
  initActiveNav();
});

/* Conteúdo público: leitura anônima. Toda escrita é protegida por RLS no banco. */
(() => {
  const config = window.DSB_CMS || {};
  const valid = /^https:\/\/[a-z0-9.-]+\.supabase\.co\/?$/i.test(config.url || '') && !!config.publishableKey;
  const $ = (q, base = document) => base.querySelector(q);
  const $$ = (q, base = document) => [...base.querySelectorAll(q)];
  const put = (q, value, base = document) => { const el = $(q, base); if (el && typeof value === 'string') el.textContent = value; };
  const safeUrl = (value, image = false) => {
    if (typeof value !== 'string') return '';
    if (image && /^images\/[a-z0-9_./-]+$/i.test(value) && !value.includes('..')) return value;
    try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; }
  };
  const templates = new Map();
  function repeat(selector, data, update) {
    if (!Array.isArray(data)) return;
    const first = $(selector);
    if (!templates.has(selector) && first) templates.set(selector, {parent: first.parentElement, node: first.cloneNode(true)});
    const cached = templates.get(selector); if (!cached) return;
    const {parent} = cached, template = cached.node;
    $$(selector, parent).forEach(el => el.remove());
    data.forEach((item, index) => { const el = template.cloneNode(true); update(el, item, index); parent.append(el); });
    // Os novos cards precisam aparecer mesmo após o observer inicial.
    $$(selector, parent).forEach(el => el.classList.add('is-visible'));
  }
  function apply(d) {
    if (!d || typeof d !== 'object') return;
    const h = d.hero || {}, t = d.headings || {}, a = d.about || {};
    put('.hero .eyebrow', h.eyebrow); put('#hero-title', h.title); put('.hero-lead', h.lead);
    put('.hero-actions .btn--primary', h.button);
    const map = {tech:'#tech-title',tech_note:'.tech-note',solutions:'#solucoes-title',solutions_lead:'#solucoes .section-lead',projects:'#projetos-title',projects_lead:'#projetos .section-lead',about:'#sobre-title',process:'#processo-title',cta:'#cta-title',cta_lead:'.cta-copy p',cta_button:'.btn--contato-final'};
    for (const [k, selector] of Object.entries(map)) put(selector, t[k]);
    $$('.about-copy > p:not(.eyebrow)').forEach((el, i) => { const v = a[`paragraph${i+1}`]; if (typeof v === 'string') el.textContent = v; });
    repeat('.tech-list li', d.tech, (el, v) => { el.textContent = String(v || ''); });
    repeat('.solution-card', d.services, (el, v, i) => {
      put('h3',v.title,el); put('p',v.description,el); put('.solution-number',String(i+1).padStart(2,'0'),el);
      const link = $('.solution-arrow',el); if(link) link.setAttribute('aria-label',`Falar sobre ${v.title || 'serviço'}`);
    });
    repeat('.project-card', d.projects, (el, v) => {
      put('.project-badge',v.badge,el);put('.project-category',v.category,el);put('h3',v.title,el);put('.project-body > p:not(.project-badge):not(.project-category)',v.description,el);
      const img = $('img',el), link = $('a.btn',el), src = safeUrl(v.image,true), href = safeUrl(v.url);
      if(img) { if(src) img.src=src; img.alt=`Pré-visualização de ${v.title || 'projeto'}`; }
      if(link) { link.href=href || '#'; link.rel='noopener noreferrer'; if(!href) link.addEventListener('click',e=>e.preventDefault()); }
    });
    repeat('.partner',d.partners,(el,v,i) => {
      put('.partner-label',`Sócio ${String(i+1).padStart(2,'0')}`,el);put('h3',v.name,el);put('.partner-role',v.role,el);
      const img=$('img',el), src=safeUrl(v.photo,true); if(img) { if(src) img.src=src; img.alt=`Foto de ${v.name || 'sócio'}`; }
      let link=$('.partner-link',el); if(!link && safeUrl(v.linkedin)) { link=document.createElement('a');link.className='partner-link';link.textContent='LinkedIn ↗';el.append(link); }
      if(link) { const href=safeUrl(v.linkedin); link.href=href || '#';link.target='_blank';link.rel='noopener noreferrer';link.hidden=!href; }
    });
    repeat('.process-step',d.process,(el,v,i)=>{put('h3',v.title,el);put('p',v.description,el);put('.process-number',String(i+1).padStart(2,'0'),el);});
    const c=d.contact || {}; const number=String(c.whatsapp || '').replace(/\D/g,'');
    if(number.length>=10 && number.length<=15) $$('[data-whatsapp]').forEach(el=>el.href=`https://wa.me/${number}?text=${encodeURIComponent(c.message || '')}`);
    ['instagram','linkedin'].forEach(k=> { const href=safeUrl(c[k]); $$(`[data-social="${k}"]`).forEach(el=>{el.href=href || '#';el.addEventListener('click',e=>{if(!href)e.preventDefault();});}); });
  }
  document.addEventListener('DOMContentLoaded', async () => {
    if(!valid) return;
    try {
      const response=await fetch(`${config.url.replace(/\/$/,'')}/rest/v1/site_content?id=eq.1&select=data`,{headers:{apikey:config.publishableKey}});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const rows=await response.json(); if(rows[0]?.data) apply(rows[0].data);
    } catch(err) { console.warn('Conteúdo não carregado; exibindo versão original.',err); }
  });
})();

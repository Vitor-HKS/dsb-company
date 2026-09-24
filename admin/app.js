(() => {
  const cfg = window.DSB_CMS || {}, root = (cfg.url || '').replace(/\/$/, '');
  const key = cfg.publishableKey || '';
  const $ = id => document.getElementById(id);
  const state = { token: null, refresh: null, expires: 0, data: null, dirty: false };
  const sections = [
    ['hero','Abertura',{eyebrow:'Chamada curta',title:'Título',lead:'Descrição',button:'Texto do botão'}],
    ['headings','Títulos e chamadas',{tech:'Título das tecnologias',tech_note:'Aviso das tecnologias',solutions:'Título das soluções',solutions_lead:'Descrição das soluções',projects:'Título dos projetos',projects_lead:'Descrição dos projetos',about:'Título sobre nós',process:'Título do processo',cta:'Título do contato',cta_lead:'Descrição do contato',cta_button:'Texto do botão de contato'}],
    ['about','Sobre nós',{paragraph1:'Primeiro parágrafo',paragraph2:'Segundo parágrafo'}],
    ['tech','Tecnologias',{value:'Tecnologia'}],
    ['services','Serviços',{title:'Nome',description:'Descrição'}],
    ['projects','Projetos',{badge:'Selo',category:'Categoria',title:'Nome',description:'Descrição',image:'Imagem',url:'Link HTTPS'}],
    ['partners','Equipe',{name:'Nome',role:'Função',photo:'Foto',linkedin:'LinkedIn HTTPS'}],
    ['process','Etapas',{title:'Etapa',description:'Descrição'}],
    ['contact','Contato e redes',{whatsapp:'WhatsApp com DDI e DDD',message:'Mensagem inicial',instagram:'Instagram HTTPS',linkedin:'LinkedIn HTTPS'}]
  ];
  const arraySections = new Set(['tech','services','projects','partners','process']);
  const imageKeys = new Set(['image','photo']);
  const navMeta = {
    hero:['◈','Atualize o destaque da página inicial.'],
    headings:['▤','Edite títulos e textos de apresentação das seções.'],
    about:['◎','Conte a história e o propósito da empresa.'],
    tech:['⌘','Gerencie as ferramentas e tecnologias exibidas.'],
    services:['◇','Organize os serviços oferecidos pela DSB.'],
    projects:['▦','Atualize os projetos e imagens do portfólio.'],
    partners:['♙','Apresente as pessoas por trás da empresa.'],
    process:['≡','Descreva as etapas do trabalho da DSB.'],
    contact:['✉','Mantenha os contatos e redes sociais atualizados.']
  };
  let activeSection='hero';
  function status(message, error=false) {
    for(const id of ['status','login-status']) {
      const el=$(id); if(el) {el.textContent=message;el.classList.toggle('is-error',error);}
    }
  }
  function setDirty(dirty) {
    state.dirty=dirty;
    const label=$('save-state'); if(label) label.textContent=dirty?'Alterações não salvas':'Tudo em dia';
  }
  function closeMenu() {
    $('sidebar').classList.remove('is-open');$('nav-backdrop').hidden=true;
    $('menu-toggle').setAttribute('aria-expanded','false');$('menu-toggle').setAttribute('aria-label','Abrir menu');
  }
  function showSection(group, focus=false) {
    activeSection=group;
    document.querySelectorAll('.content-panel').forEach(panel=>panel.classList.toggle('is-active',panel.dataset.section===group));
    document.querySelectorAll('.nav-item').forEach(btn=>{
      const selected=btn.dataset.target===group;btn.classList.toggle('is-active',selected);
      if(selected) btn.setAttribute('aria-current','page'); else btn.removeAttribute('aria-current');
    });
    const item=sections.find(([id])=>id===group);if(!item)return;
    $('page-title').textContent=item[1];$('breadcrumb-active').textContent=item[1];
    $('page-description').textContent=navMeta[group][1];
    const count=state.data?.[group];$('page-count').textContent=Array.isArray(count)?`${document.querySelectorAll(`[data-section="${group}"] .row`).length} itens`:`${Object.keys(item[2]).length} campos`;
    closeMenu();window.scrollTo({top:0,behavior:'smooth'});
    if(focus) $('page-title').focus({preventScroll:true});
  }
  function buildNavigation() {
    const nav=$('section-nav');nav.replaceChildren();
    for(const [group,title] of sections) {
      const btn=document.createElement('button');btn.type='button';btn.className='nav-item';btn.dataset.target=group;
      const icon=document.createElement('span');icon.className='nav-icon';icon.setAttribute('aria-hidden','true');icon.textContent=navMeta[group][0];
      const label=document.createElement('span');label.textContent=title;btn.append(icon,label);
      btn.addEventListener('click',()=>showSection(group,true));nav.append(btn);
    }
  }
  function configured() { return /^https:\/\/[a-z0-9.-]+\.supabase\.co$/i.test(root) && !!key; }
  async function api(path, options={}) {
    const headers = {apikey:key, ...(options.body && typeof options.body === 'string' ? {'Content-Type':'application/json'} : {}), ...(state.token ? {Authorization:`Bearer ${state.token}`} : {}), ...options.headers};
    const response = await fetch(root + path,{...options,headers});
    if(!response.ok) { let msg='Erro '+response.status; try { const j=await response.json(); msg=j.msg || j.message || j.error_description || j.error || msg; } catch {} throw new Error(msg); }
    if(response.status===204) return null;
    const text=await response.text(); return text ? JSON.parse(text) : null;
  }
  function persist(auth) {
    state.token=auth.access_token;state.refresh=auth.refresh_token;
    state.expires=Date.now() + (auth.expires_in || 3600)*1000;
    sessionStorage.setItem('dsb-auth',JSON.stringify({refresh:state.refresh,expires:state.expires}));
  }
  async function ensureToken() {
    if(state.token && Date.now() < state.expires-60000) return;
    if(!state.refresh) throw new Error('Sessão encerrada. Entre novamente.');
    // The refresh request must not send an expired bearer token.
    const old=state.token;state.token=null;
    try { persist(await api('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:state.refresh})})); }
    catch(e) { state.token=old;throw e; }
  }
  async function requireAdmin() {
    await ensureToken();
    const user=await api('/auth/v1/user');
    const rows=await api(`/rest/v1/admin_users?id=eq.${encodeURIComponent(user.id)}&select=id`);
    if(!Array.isArray(rows) || rows.length!==1) throw new Error('Esta conta não tem permissão para editar.');
  }
  function field(label,value,name,group,index) {
    const wrap=document.createElement('label');wrap.textContent=label;
    const multiline=String(value || '').length > 110 || ['description','paragraph1','paragraph2','lead','projects_lead','solutions_lead','message'].includes(name);
    const input=document.createElement(multiline ? 'textarea':'input');
    if(!multiline) input.type='text'; input.value=value ?? '';input.required=!imageKeys.has(name) && !['linkedin','instagram'].includes(name);
    input.maxLength=multiline ? 1500 : 350; input.placeholder=label;
    input.dataset.field=name; input.dataset.group=group;if(index!==null) input.dataset.index=String(index);
    wrap.append(input);
    if(imageKeys.has(name)) {
      const file=document.createElement('input');file.type='file';file.accept='image/jpeg,image/png,image/webp';file.dataset.upload=name;file.dataset.group=group;file.dataset.index=String(index);
      const note=document.createElement('span');note.className='file-note';note.textContent='Imagem JPG, PNG ou WebP até 3 MB. O envio ocorre ao salvar.';
      wrap.append(file,note);
    }
    return wrap;
  }
  function buildRow(group,schema,item,index) {
    const row=document.createElement('div');row.className='row';row.dataset.row=group;
    const head=document.createElement('div');head.className='row-head';const title=document.createElement('h3'); title.textContent=group==='tech' ? `Tecnologia ${index+1}` : `${index+1}. ${item.title || item.name || ''}`;
    const remove=document.createElement('button');remove.type='button';remove.className='danger';remove.textContent='Remover';remove.addEventListener('click',()=>{row.remove();setDirty(true);showSection(group);});head.append(title,remove);row.append(head);
    const fields=document.createElement('div');fields.className='row-fields';
    for(const [name,label] of Object.entries(schema)) fields.append(field(label, group==='tech'?item:item[name],name,group,index));
    row.append(fields);
    return row;
  }
  function render(data) {
    $('sections').replaceChildren();
    for(const [group,title,schema] of sections) {
      const box=document.createElement('section');box.className='card content-panel';box.dataset.section=group;box.setAttribute('aria-label',title);
      const h=document.createElement('h2');h.className='section-title';h.textContent=title;box.append(h);
      const subtitle=document.createElement('p');subtitle.className='section-subtitle';subtitle.textContent=navMeta[group][1];box.append(subtitle);
      if(arraySections.has(group)) {
        (data[group] || []).forEach((item,i)=>box.append(buildRow(group,schema,item,i)));
        const add=document.createElement('button');add.type='button';add.className='secondary add-button';add.textContent=`+ Adicionar ${group==='tech'?'tecnologia':'item'}`;
        add.addEventListener('click',()=>{ const empty=group==='tech'?'':Object.fromEntries(Object.keys(schema).map(k=>[k,'']));box.insertBefore(buildRow(group,schema,empty,box.querySelectorAll('.row').length),add);setDirty(true);showSection(group); });
        box.append(add);
      } else { const fields=document.createElement('div');fields.className='fields-grid';for(const [name,label] of Object.entries(schema)) fields.append(field(label,(data[group] || {})[name],name,group,null));box.append(fields); }
      $('sections').append(box);
    }
    showSection(activeSection);
  }
  function collect() {
    for(const [group] of sections) {
      const panel=document.querySelector(`[data-section="${group}"]`);
      const invalid=[...panel.querySelectorAll('[required]')].find(el=>!el.value.trim());
      if(invalid) { showSection(group);invalid.focus();throw new Error(`Preencha o campo ${invalid.closest('label')?.firstChild?.textContent || 'obrigatório'} em ${sections.find(s=>s[0]===group)[1]}.`); }
    }
    const out=structuredClone(state.data);
    for(const [group,,schema] of sections) {
      const box=document.querySelector(`[data-section="${group}"]`);
      if(arraySections.has(group)) {
        out[group]=[...box.querySelectorAll('.row')].map(row=> group==='tech' ? row.querySelector('[data-field]').value.trim() : Object.fromEntries(Object.keys(schema).map(k=>[k,row.querySelector(`[data-field="${k}"]`).value.trim()])));
      } else out[group]=Object.fromEntries(Object.keys(schema).map(k=>[k,box.querySelector(`[data-field="${k}"]`).value.trim()]));
    }
    return out;
  }
  async function uploadFiles(data) {
    for(const group of ['projects','partners']) {
      const rows=[...document.querySelectorAll(`[data-section="${group}"] .row`)];
      for(let i=0;i<rows.length;i++) {
        const file=rows[i].querySelector('[data-upload]')?.files[0];if(!file) continue;
        if(!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>3*1024*1024) throw new Error('Use JPG, PNG ou WebP com no máximo 3 MB.');
        await ensureToken();
        const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
        const path=`${group}/${crypto.randomUUID()}.${extension}`;
        const result=await fetch(`${root}/storage/v1/object/site-images/${path}`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${state.token}`,'Content-Type':file.type,'Cache-Control':'3600'},body:file});
        if(!result.ok) throw new Error('Não foi possível enviar a imagem. Verifique as permissões de armazenamento.');
        const field=group==='projects'?'image':'photo';
        data[group][i][field]=`${root}/storage/v1/object/public/site-images/${path}`;
      }
    }
  }
  async function enter() {
    await requireAdmin();
    const rows=await api('/rest/v1/site_content?id=eq.1&select=data');
    if(!rows[0]?.data) throw new Error('Conteúdo inicial não encontrado. Execute o SQL de instalação.');
    state.data=rows[0].data;buildNavigation();render(state.data);setDirty(false);
    $('login-view').hidden=true;$('editor-view').hidden=false;$('logout').hidden=false;status('Painel pronto para edição.');
  }
  function logout() { state.token=null;state.refresh=null;sessionStorage.removeItem('dsb-auth');$('login-view').hidden=false;$('editor-view').hidden=true;closeMenu();setDirty(false);status('Sessão encerrada.'); }
  document.addEventListener('DOMContentLoaded',async()=>{
    if(!configured()) { status('Configure URL e chave publicável em js/cms-config.js para ativar o painel.'); return; }
    $('login-form').addEventListener('submit',async e=>{
      e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;status('Entrando...');
      try { const fd=new FormData(e.target);persist(await api('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:fd.get('email'),password:fd.get('password')})})); await enter(); e.target.reset(); }
      catch(err) { status(err.message);logout();status(err.message); }finally{button.disabled=false;}
    });
    $('editor-form').addEventListener('input',()=>setDirty(true));
    $('menu-toggle').addEventListener('click',()=>{const open=!$('sidebar').classList.contains('is-open');$('sidebar').classList.toggle('is-open',open);$('nav-backdrop').hidden=!open;$('menu-toggle').setAttribute('aria-expanded',String(open));$('menu-toggle').setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});
    $('nav-backdrop').addEventListener('click',closeMenu);
    document.addEventListener('keydown',e=>{if(e.key==='Escape' && $('sidebar').classList.contains('is-open')){closeMenu();$('menu-toggle').focus();}});
    $('editor-form').addEventListener('submit',async e=>{
      e.preventDefault();const button=$('save');button.disabled=true;status('Salvando...');
      try {
        await requireAdmin();const data=collect();
        if(!/^\d{10,15}$/.test(data.contact.whatsapp)) throw new Error('WhatsApp: informe DDI e DDD, apenas números.');
        for(const p of data.projects) if(p.url && !/^https:\/\//i.test(p.url)) throw new Error('Links de projetos devem começar com https://');
        await uploadFiles(data);
        await ensureToken();
        const rows=await api('/rest/v1/site_content?id=eq.1&select=id',{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({data})});
        if(!rows?.length) throw new Error('Alteração não confirmada pelo banco.');
        state.data=data;render(data);setDirty(false);status('Publicado! Atualize o site para ver as alterações.');
      }catch(err){status(`Não foi possível salvar: ${err.message}`,true);}finally{button.disabled=false;}
    });
    $('logout').addEventListener('click',logout);
    window.addEventListener('beforeunload',e=>{if(state.dirty){e.preventDefault();e.returnValue='';}});
    try { const saved=JSON.parse(sessionStorage.getItem('dsb-auth') || 'null');if(saved?.refresh){state.refresh=saved.refresh;state.expires=saved.expires;await enter();} }catch{logout();}
  });
})();

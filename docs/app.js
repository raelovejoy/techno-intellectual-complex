(async function () {
  'use strict';
  const main = document.getElementById('content');
  const fields = ['search','cluster','type','review','confidence'];
  const controls = Object.fromEntries(fields.map(id => [id,document.getElementById(id)]));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const human = value => String(value || '').replace(/[_-]/g,' ').toLowerCase();
  let graph, cy, layout = 'cards', page = 0;
  const size = 24;
  const themeButton = document.getElementById('theme');
  function setTheme(value) {
    document.documentElement.dataset.theme = value;
    themeButton.textContent = 'Theme: ' + value;
    try { localStorage.setItem('atlas-theme',value); } catch {}
  }
  let initialTheme;
  try { initialTheme = localStorage.getItem('atlas-theme'); } catch {}
  setTheme(initialTheme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  themeButton.addEventListener('click', () => {setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); render();});
  try {
    const response = await fetch('graph.json');
    if (!response.ok) throw new Error('Dataset response ' + response.status);
    graph = await response.json();
  } catch {
    main.innerHTML = '<h1>Research data could not load</h1><p>Reload this page, or <a href="https://github.com/raelovejoy/techno-intellectual-complex/tree/main/data">read the data in the repository</a>.</p>';
    document.getElementById('dataset-status').textContent = 'Dataset unavailable';
    return;
  }
  const nodes = graph.nodes.map(n=>n.data).sort((a,b)=>a.label.localeCompare(b.label));
  const edges = graph.edges.map(e=>e.data);
  const byId = new Map(nodes.map(n=>[n.id,n]));
  const audited = edges.filter(e=>e.review_status==='audited').length;
  document.getElementById('dataset-status').textContent = `${nodes.length} entities · ${edges.length} relationships · ${audited} audited · ${edges.length-audited} review pending`;
  for (const [field, property] of [['cluster','cluster'],['type','type']]) {
    [...new Set(nodes.map(n=>n[property]).filter(Boolean))].sort().forEach(v=>controls[field].add(new Option(human(v),v)));
  }
  function state() {
    const [path, query=''] = location.hash.slice(1).split('?');
    return {path:path || 'directory', query:new URLSearchParams(query)};
  }
  function url(path, extras={}) {
    const q = new URLSearchParams();
    fields.forEach(k=>{if(controls[k].value)q.set(k,controls[k].value);});
    Object.entries(extras).forEach(([k,v])=>{if(v)q.set(k,v);});
    return '#'+path+(q.size?'?'+q:'');
  }
  const entityLink = id => `<a href="${esc(url('entity/'+encodeURIComponent(id)))}">${esc(byId.get(id)?.label || id)}</a>`;
  function sourceLinks(ids) {
    return '<ul class="sources-list">'+String(ids||'').split('|').filter(Boolean).map(id=>{
      const s=graph.sources[id];
      if(!s || !/^https:\/\//.test(s.url))return '<li>Source unavailable: '+esc(id)+'</li>';
      return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a><div class="meta">${esc(id)} · ${esc(s.source_type)}${s.published_date?' · published '+esc(s.published_date):''}${s.last_checked?' · checked '+esc(s.last_checked):' · check date not recorded'}</div></li>`;
    }).join('')+'</ul>';
  }
  const badge = e => e.review_status==='audited'?'<span class="badge">Audited</span>':'<span class="badge pending">Review pending</span>';
  const edgeTitle = e => `${entityLink(e.source)} <span class="muted">— ${esc(human(e.relationship))} →</span> ${entityLink(e.target)}`;
  function evidence(e) {
    return `<p>${esc(e.basis)}</p><dl><dt>Review</dt><dd>${badge(e)}${e.last_verified?' · checked '+esc(e.last_verified):''}</dd><dt>Recorded confidence</dt><dd>${esc(human(e.confidence))}${e.review_status!=='audited'?' — not yet checked under the current review standard':''}</dd>${e.claim_kind?'<dt>Claim kind</dt><dd>'+esc(human(e.claim_kind))+'</dd>':''}${e.date_start||e.date_end?'<dt>Period</dt><dd>'+esc(e.date_start||'Start unknown')+' — '+esc(e.date_end||'End not established')+'</dd>':''}${e.amount_usd?'<dt>Reported amount</dt><dd>$'+Number(e.amount_usd).toLocaleString('en-US')+' USD</dd>':''}${e.caveat?'<dt>Limits</dt><dd>'+esc(e.caveat)+'</dd>':''}${e.source_locator?'<dt>Where in the source</dt><dd>'+esc(e.source_locator)+'</dd>':''}</dl>${sourceLinks(e.sources)}`;
  }
  function edgeRecord(e,open=false) {
    return `<article class="relationship"><div>${edgeTitle(e)}</div><details${open?' open':''}><summary>${badge(e)} · Evidence and limits <span class="meta">${esc(e.id)}</span></summary>${evidence(e)}</details></article>`;
  }
  function matchesNode(n) {
    const q=controls.search.value.trim().toLowerCase();
    return (!q || [n.label,n.summary,n.philosophy,n.cluster,n.location].join(' ').toLowerCase().includes(q)) && (!controls.cluster.value || n.cluster===controls.cluster.value) && (!controls.type.value || n.type===controls.type.value);
  }
  function matchesReview(e) {
    return (!controls.review.value || e.review_status===controls.review.value) && (!controls.confidence.value || e.confidence===controls.confidence.value);
  }
  function selection() {
    const matching=nodes.filter(matchesNode), ids=new Set(matching.map(n=>n.id));
    // Retain the other endpoint so a name search reveals that entity's relationships.
    const selectedEdges=edges.filter(e=>matchesReview(e)&&(ids.has(e.source)||ids.has(e.target)));
    const connected=new Set(selectedEdges.flatMap(e=>[e.source,e.target]));
    const selectedNodes=matching.filter(n=>!(controls.review.value||controls.confidence.value)||connected.has(n.id));
    return {nodes:selectedNodes,edges:selectedEdges};
  }
  function heading(title,description,count='') {
    return `<div class="view-head"><div><p class="eyebrow">Research atlas</p><h1>${esc(title)}</h1><p class="muted">${esc(description)}</p></div>${count!==''?'<span class="count">'+esc(count)+'</span>':''}</div>`;
  }
  function pagination(total) {
    return total>size?`<div class="pager"><button data-page="${page-1}" ${page===0?'disabled':''}>Previous</button><span>Page ${page+1} of ${Math.ceil(total/size)}</span><button data-page="${page+1}" ${(page+1)*size>=total?'disabled':''}>Next</button></div>`:'';
  }
  const empty = '<p class="empty">No records match these filters. Try a broader search or clear the filters.</p>';
  function directory(selected) {
    const rows=selected.nodes.slice(page*size,(page+1)*size);
    main.innerHTML=heading('People, institutions & ideas','Open a dossier to follow its relationships and inspect the evidence.',selected.nodes.length+' entities')+`<div class="toolbar" aria-label="Directory layout"><button data-layout="cards" aria-pressed="${layout==='cards'}">Cards</button><button data-layout="table" aria-pressed="${layout==='table'}">Table</button></div>`+(rows.length?(layout==='cards'?'<div class="grid">'+rows.map(n=>{
      const count=edges.filter(e=>e.source===n.id||e.target===n.id).length;
      return `<a class="card" href="${esc(url('entity/'+encodeURIComponent(n.id)))}"><div class="meta">${esc(human(n.type))} / ${esc(human(n.cluster))}</div><h2 style="margin:0 0 12px">${esc(n.label)}</h2><p>${esc(n.summary)}</p><span class="meta">${count} connections · Open dossier →</span></a>`;
    }).join('')+'</div>':'<div class="table-wrap"><table><thead><tr><th>Entity</th><th>Type / cluster</th><th>Summary</th></tr></thead><tbody>'+rows.map(n=>`<tr><td>${entityLink(n.id)}</td><td>${esc(human(n.type))}<br><span class="meta">${esc(human(n.cluster))}</span></td><td>${esc(n.summary)}</td></tr>`).join('')+'</tbody></table></div>'):empty)+pagination(selected.nodes.length);
  }
  function dossier(id) {
    const n=byId.get(id);
    if(!n){main.innerHTML=heading('Entity not found','This record may have moved. Browse the directory to find it.');return;}
    const related=edges.filter(e=>e.source===id||e.target===id).sort((a,b)=>(b.review_status==='audited')-(a.review_status==='audited'));
    document.title=n.label+' · Techno-Intellectual Atlas';
    main.innerHTML=`<p><a href="${esc(url('directory'))}">← Directory</a></p>`+heading(n.label,human(n.type)+' / '+human(n.cluster))+`<div class="profile"><section><p>${esc(n.summary)}</p><div class="connection-links"><a href="${esc('#map?focus='+encodeURIComponent(id))}">View neighborhood map →</a></div><h2>Connections <span class="muted">${related.length}</span></h2><p class="small muted">Complete dossier: connections here include all review levels, regardless of browse filters.</p>${related.map(e=>edgeRecord(e)).join('')||'<p>No connections recorded.</p>'}</section><aside class="profile-side"><h2>Profile notes</h2><dl><dt>Location</dt><dd>${esc(n.location||'Not recorded')}</dd><dt>Philosophy note · not separately audited</dt><dd>${esc(n.philosophy||'Not recorded')}</dd><dt>Research notes</dt><dd>${esc(n.notes||'No additional notes')}</dd></dl><h2>Profile sources</h2>${sourceLinks(n.sources)}</aside></div>`;
  }
  function relationshipView(selected,funding=false) {
    const rows=selected.edges.filter(e=>!funding || /FUND|GRANT|DONAT|SPONSOR|INVEST/.test(e.relationship));
    main.innerHTML=heading(funding?'Funding & investment':'Relationship ledger',funding?'Recorded financial ties, with the original direction and relationship type preserved.':'Every connection is a claim with its own evidence and review status.',rows.length+' records')+(funding?'<p class="notice funding-note">Grant recommendations are not confirmed payments. Missing amounts remain unknown; these records are not a complete funding history.</p>':'')+(rows.length?(funding?'<div class="table-wrap"><table><thead><tr><th>Relationship</th><th>Period</th><th>Amount (USD)</th><th>Evidence</th></tr></thead><tbody>'+rows.slice(page*size,(page+1)*size).map(e=>`<tr><td>${edgeTitle(e)}</td><td>${esc(e.date_start||'Not recorded')}${e.date_end?' – '+esc(e.date_end):''}</td><td class="amount">${e.amount_usd?'$'+Number(e.amount_usd).toLocaleString('en-US'):'Not recorded'}</td><td><details><summary>${badge(e)}</summary>${evidence(e)}</details></td></tr>`).join('')+'</tbody></table></div>':rows.slice(page*size,(page+1)*size).map(e=>edgeRecord(e)).join('')):empty)+pagination(rows.length);
  }
  function map(selected,focus) {
    const focal=byId.get(focus);
    const mapEdges=focal?edges.filter(e=>matchesReview(e)&&(e.source===focus||e.target===focus)):selected.edges;
    const ids=new Set(mapEdges.flatMap(e=>[e.source,e.target]));
    if(focal)ids.add(focus);else selected.nodes.forEach(n=>ids.add(n.id));
    main.innerHTML=heading(focal?focal.label+' / neighborhood':'Relationship map','Select a node for its dossier or a line for evidence. Search reveals matching entities and their neighbors.',ids.size+' entities')+'<div class="toolbar"><button id="fit-map">Fit map</button><button id="zoom-in" aria-label="Zoom in">Zoom +</button><button id="zoom-out" aria-label="Zoom out">Zoom −</button>'+(focal?'<a href="#map">Whole network</a>':'')+'</div><div class="map-legend"><span>Audited relationship</span><span>Review pending</span></div><div id="cy" role="img" aria-label="Interactive relationship network. All connections are also available in the accessible list below."></div><section class="map-detail" id="map-detail" aria-live="polite"><p class="muted">Select an entity or relationship to inspect it.</p></section><details><summary>Browse these connections as text ('+mapEdges.length+')</summary>'+mapEdges.map(e=>edgeRecord(e)).join('')+(mapEdges.length?'':'<p>No matching connections.</p>')+'</details>';
    if(typeof cytoscape==='undefined'){document.getElementById('cy').innerHTML='<p class="notice">The map library could not load. Use the connection list below or the directory.</p>';return;}
    const css=getComputedStyle(document.documentElement), color=v=>css.getPropertyValue(v).trim();
    cy=cytoscape({container:document.getElementById('cy'),elements:[...nodes.filter(n=>ids.has(n.id)).map(n=>({data:n})),...mapEdges.map(e=>({data:e}))],style:[
      {selector:'node',style:{label:'data(label)','background-color':color('--accent'),color:color('--text'),'font-size':13,'text-wrap':'wrap','text-max-width':120,'text-valign':'bottom','text-margin-y':8,width:24,height:24}},
      {selector:'node[type="person"]',style:{shape:'diamond'}},
      {selector:'edge',style:{width:1.5,'line-color':color('--pending'),'target-arrow-color':color('--pending'),'target-arrow-shape':'triangle','curve-style':'bezier','line-style':'dashed',opacity:.65}},
      {selector:'edge[review_status="audited"]',style:{'line-color':color('--accent'),'target-arrow-color':color('--accent'),'line-style':'solid',width:2}},
      {selector:':selected',style:{'border-width':3,'border-color':color('--text'),'line-color':color('--text'),'target-arrow-color':color('--text')}}
    ],layout:{name:'cose',animate:false,nodeRepulsion:16000,idealEdgeLength:150,gravity:.15,padding:40},minZoom:.15,maxZoom:3,wheelSensitivity:.2});
    cy.on('tap','node, edge',event=>{const el=event.target,d=el.data();document.getElementById('map-detail').innerHTML=el.isNode()?'<h2>'+entityLink(d.id)+'</h2><p>'+esc(d.summary)+'</p><a href="'+esc(url('entity/'+encodeURIComponent(d.id)))+'">Open full dossier →</a>':edgeRecord(d,true);});
    document.getElementById('fit-map').onclick=()=>cy.fit(undefined,40);
    document.getElementById('zoom-in').onclick=()=>cy.zoom({level:cy.zoom()*1.3,renderedPosition:{x:cy.width()/2,y:cy.height()/2}});
    document.getElementById('zoom-out').onclick=()=>cy.zoom({level:cy.zoom()/1.3,renderedPosition:{x:cy.width()/2,y:cy.height()/2}});
  }
  function sourcesView(selected) {
    const q=controls.search.value.toLowerCase();
    const relationalFilter=controls.cluster.value||controls.type.value||controls.review.value||controls.confidence.value;
    const ids=new Set([...selected.nodes,...selected.edges].flatMap(x=>(x.sources||'').split('|')));
    const rows=Object.entries(graph.sources).filter(([id,s])=>(!relationalFilter||ids.has(id))&&(!q||[id,s.title,s.url,s.source_type].join(' ').toLowerCase().includes(q)));
    main.innerHTML=heading('Source library','Open the original material. A source listing alone does not validate every claim that cites it.',rows.length+' sources')+(rows.length?sourceLinks(rows.slice(page*size,(page+1)*size).map(([id])=>id).join('|')):empty)+pagination(rows.length);
  }
  function method() {
    main.innerHTML=heading('How to read this atlas','A working research collection with visible evidence and limits.')+`<div class="prose"><h2>Different views, one dataset</h2><p>The directory, dossiers, map, relationship ledger, and funding view all use the same entity and relationship records. Changes belong in the repository’s canonical data files.</p><h2>What “audited” means</h2><p>A relationship’s wording has been checked against its cited source, with a source location, check date, and limits. This is not necessarily independent corroboration: many sources are institutions describing themselves.</p><h2>What still needs review</h2><p>${edges.length-audited} relationships retain older confidence labels and await claim-level review. Entity summaries and philosophy notes have not received the same separate audit. Use them as research leads.</p><h2>Read the relationship type</h2><p>Employment, funding, attendance, website work, and ideological agreement are different claims. One connection does not establish another. A grant recommendation is not a completed payment. Missing amounts and dates mean “not recorded,” not zero or ongoing.</p><h2>Scope and gaps</h2><p>This is a partial collection, not a census or a ranking of influence. Clusters are research navigation categories. Network position reflects what has been collected, and may reflect uneven coverage.</p><h2>Sources and corrections</h2><p>Each dossier and relationship links to its sources. Source check dates describe a review date, not the date a relationship began.</p><p><a href="https://github.com/raelovejoy/techno-intellectual-complex/blob/main/METHODOLOGY.md" target="_blank" rel="noopener">Full research method ↗</a> · <a href="https://github.com/raelovejoy/techno-intellectual-complex/issues/new/choose" target="_blank" rel="noopener">Suggest a correction ↗</a></p><h2>Download the current snapshot</h2><p><a href="graph.json" download>Graph data (JSON)</a> · <a href="https://github.com/raelovejoy/techno-intellectual-complex/tree/main/data" target="_blank" rel="noopener">Canonical CSV files ↗</a></p></div>`;
  }
  function render() {
    if(cy){cy.destroy();cy=null;}
    const s=state(), view=s.path.split('/')[0];
    document.title='Techno-Intellectual Atlas';
    document.querySelectorAll('.views a').forEach(a=>{const key=a.getAttribute('href').slice(1).split('?')[0];a.href=url(key);if(key===view||(view==='entity'&&key==='directory'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    const selected=selection();
    if(view==='entity'){let id;try{id=decodeURIComponent(s.path.slice(7));}catch{id='';}dossier(id);}
    else if(view==='map')map(selected,s.query.get('focus'));
    else if(view==='relationships')relationshipView(selected);
    else if(view==='funding')relationshipView(selected,true);
    else if(view==='sources')sourcesView(selected);
    else if(view==='method')method();
    else directory(selected);
  }
  function readRoute() {
    const s=state();fields.forEach(k=>controls[k].value=s.query.get(k)||'');page=0;render();
  }
  fields.forEach(k=>controls[k].addEventListener(k==='search'?'input':'change',()=>{page=0;const s=state();history.replaceState(null,'',url(s.path,{focus:s.query.get('focus')}));render();}));
  document.getElementById('reset').onclick=()=>{fields.forEach(k=>controls[k].value='');page=0;history.replaceState(null,'',url(state().path));render();};
  main.addEventListener('click',event=>{const layoutButton=event.target.closest('[data-layout]'),pageButton=event.target.closest('[data-page]');if(layoutButton){layout=layoutButton.dataset.layout;render();}if(pageButton&&!pageButton.disabled){page=Number(pageButton.dataset.page);render();main.focus();main.scrollIntoView({block:'start'});}});
  window.addEventListener('hashchange',readRoute);
  readRoute();
})();

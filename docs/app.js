(async function () {
  'use strict';
  const main = document.getElementById('content');
  const fields = ['search','cluster','type','review','confidence'];
  const controls = Object.fromEntries(fields.map(id => [id,document.getElementById(id)]));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const human = value => String(value || '').replace(/[_-]/g,' ').toLowerCase();
  let graph, layout = 'table', page = 0;
  const size = 24;
  const themeButton = document.getElementById('theme');
  function setTheme(value) {
    document.documentElement.dataset.theme = value;
    themeButton.textContent = 'Theme: ' + value;
    try { localStorage.setItem('atlas-theme',value); } catch {}
  }
  let initialTheme;
  try { initialTheme = localStorage.getItem('atlas-theme'); } catch {}
  setTheme(initialTheme || 'light');
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
    main.innerHTML=heading('People, institutions & ideas','Open a dossier to follow its relationships and inspect the evidence.',selected.nodes.length+' entities')+`<div class="toolbar" aria-label="Directory layout"><button data-layout="cards" aria-pressed="${layout==='cards'}">List</button><button data-layout="table" aria-pressed="${layout==='table'}">Table</button></div>`+(rows.length?(layout==='cards'?'<div class="grid">'+rows.map(n=>{
      const count=edges.filter(e=>e.source===n.id||e.target===n.id).length;
      return `<a class="card" href="${esc(url('entity/'+encodeURIComponent(n.id)))}"><div class="meta">${esc(human(n.type))} / ${esc(human(n.cluster))}</div><h2 style="margin:0 0 12px">${esc(n.label)}</h2><p>${esc(n.summary)}</p><span class="meta">${count} connections · Open dossier →</span></a>`;
    }).join('')+'</div>':'<div class="table-wrap"><table><thead><tr><th>Entity</th><th>Type / cluster</th><th>Summary</th></tr></thead><tbody>'+rows.map(n=>`<tr><td>${entityLink(n.id)}</td><td>${esc(human(n.type))}<br><span class="meta">${esc(human(n.cluster))}</span></td><td>${esc(n.summary)}</td></tr>`).join('')+'</tbody></table></div>'):empty)+pagination(selected.nodes.length);
  }
  function dossier(id) {
    const n=byId.get(id);
    if(!n){main.innerHTML=heading('Entity not found','This record may have moved. Browse the directory to find it.');return;}
    const related=edges.filter(e=>e.source===id||e.target===id).sort((a,b)=>(b.review_status==='audited')-(a.review_status==='audited'));
    const other=e=>e.source===id?e.target:e.source;
    const directIds=new Set(related.map(other));
    const groups=[['People','person'],['Organizations','organization'],['Events','event'],['Projects, places & ideas','other']];
    const groupsHtml=groups.map(([label,type])=>{
      const rows=related.filter(e=>type==='other'?!['person','organization','event'].includes(byId.get(other(e)).type):byId.get(other(e)).type===type);
      return rows.length?'<section><h2>'+label+' <span class="muted">'+new Set(rows.map(other)).size+'</span></h2>'+rows.map(e=>edgeRecord(e)).join('')+'</section>':'';
    }).join('');
    // These are paths through two explicit records, never invented direct associations.
    const paths=new Map();
    for(const first of related){
      const via=other(first);
      for(const second of edges){
        if(second.source!==via&&second.target!==via)continue;
        const end=second.source===via?second.target:second.source;
        if(end===id||directIds.has(end))continue;
        if(!paths.has(end))paths.set(end,[]);
        const list=paths.get(end);
        if(!list.some(p=>p.first.id===first.id&&p.second.id===second.id))list.push({via,first,second});
      }
    }
    const contextual=[...paths.entries()].sort(([a],[b])=>byId.get(a).label.localeCompare(byId.get(b).label));
    const contextHtml=contextual.length?'<section><h2>Connected through an intermediary <span class="muted">'+contextual.length+'</span></h2><p class="small muted">Two recorded relationships, not a direct affiliation. Event roles remain event-specific; other paths may include contextual or unreviewed claims.</p>'+contextual.map(([end,links])=>'<article class="relationship"><h3>'+entityLink(end)+'</h3><div class="meta">'+esc(human(byId.get(end).type))+'</div>'+links.map(p=>'<details><summary>Via '+esc(byId.get(p.via).label)+' · '+esc(human(p.second.relationship))+' · '+(p.first.review_status==='audited'&&p.second.review_status==='audited'?'both records audited':'includes review-pending record')+'</summary>'+edgeRecord(p.first)+edgeRecord(p.second)+'</details>').join('')+'</article>').join('')+'</section>':'';
    const eventRows=(graph.events||[]).filter(e=>[e.venue_node_id,...e.host_node_ids.split('|'),...e.participant_org_ids.split('|')].includes(id));
    const eventHtml=eventRows.length?'<section><h2>Event records <span class="muted">'+eventRows.length+'</span></h2>'+eventRows.map(e=>'<article class="relationship"><h3>'+esc(e.name)+'</h3><div class="meta">'+esc(e.date)+' · '+esc(e.city)+' · '+(e.review_status==='audited'?'listing reviewed '+esc(e.last_verified):'legacy record / review pending')+'</div><p>'+esc(e.topic)+'</p>'+(e.event_node_id?'<p>'+entityLink(e.event_node_id)+' — full listed roster</p>':'')+'<dl><dt>Recorded venue</dt><dd>'+(e.venue_node_id?entityLink(e.venue_node_id):'Not recorded')+'</dd><dt>Recorded hosts</dt><dd>'+e.host_node_ids.split('|').filter(Boolean).map(entityLink).join(', ')+'</dd><dt>Other listed organizations</dt><dd>'+(e.participant_org_ids.split('|').filter(Boolean).map(entityLink).join(', ')||'Not recorded')+'</dd></dl><details><summary>Event source and notes</summary><p>'+esc(e.notes)+'</p>'+sourceLinks(e.source_id)+'</details></article>').join('')+'</section>':'';
    const peopleCount=new Set(related.filter(e=>byId.get(other(e)).type==='person').map(other)).size;
    document.title=n.label+' · Techno-Intellectual Atlas';
    main.innerHTML=`<p><a href="${esc(url('directory'))}">← Directory</a></p>`+heading(n.label,human(n.type)+' / '+human(n.cluster))+`<div class="profile"><section><p>${esc(n.summary)}</p><div class="connection-links"><a href="${esc('#map?focus='+encodeURIComponent(id))}">Explore connections →</a></div><p class="notice">Partial research coverage: ${directIds.size} directly connected entities · ${contextual.length} through an intermediary. Missing records do not mean no relationship exists.</p>${!peopleCount&&n.type==='organization'?'<p class="small muted">No direct person-role records captured yet. Any people shown through events or other organizations are not being presented as staff or members.</p>':''}<h2>Recorded direct relationships <span class="muted">${related.length}</span></h2><p class="small muted">All recorded relationships are shown, regardless of browse filters. Expand a record to inspect its sources and limits.</p>${groupsHtml||'<p>No direct relationships recorded.</p>'}${contextHtml}${eventHtml}</section><aside class="profile-side"><h2>Profile notes</h2><dl><dt>Location</dt><dd>${esc(n.location||'Not recorded')}</dd><dt>Philosophy note · not separately audited</dt><dd>${esc(n.philosophy||'Not recorded')}</dd><dt>Research notes</dt><dd>${esc(n.notes||'No additional notes')}</dd></dl><h2>Profile sources</h2>${sourceLinks(n.sources)}<h2>Coverage still needed</h2><p class="small muted">${n.type==='organization'?'Founders, current and former staff, board, funders, collaborators, and governance need systematic source review.':n.type==='person'?'Current and former roles, collaborations, publications, and publicly stated positions need systematic source review.':'Additional participants, dates, and relationship context may be missing.'} This is not a complete roster.</p></aside></div>`;
  }
  function relationshipView(selected,funding=false) {
    const rows=selected.edges.filter(e=>!funding || /FUND|GRANT|DONAT|SPONSOR|INVEST/.test(e.relationship));
    main.innerHTML=heading(funding?'Funding & investment':'Relationship ledger',funding?'Recorded financial ties, with the original direction and relationship type preserved.':'Every connection is a claim with its own evidence and review status.',rows.length+' records')+(funding?'<p class="notice funding-note">Grant recommendations are not confirmed payments. Missing amounts remain unknown; these records are not a complete funding history.</p>':'')+(rows.length?(funding?'<div class="table-wrap"><table><thead><tr><th>Relationship</th><th>Period</th><th>Amount (USD)</th><th>Evidence</th></tr></thead><tbody>'+rows.slice(page*size,(page+1)*size).map(e=>`<tr><td>${edgeTitle(e)}</td><td>${esc(e.date_start||'Not recorded')}${e.date_end?' – '+esc(e.date_end):''}</td><td class="amount">${e.amount_usd?'$'+Number(e.amount_usd).toLocaleString('en-US'):'Not recorded'}</td><td><details><summary>${badge(e)}</summary>${evidence(e)}</details></td></tr>`).join('')+'</tbody></table></div>':rows.slice(page*size,(page+1)*size).map(e=>edgeRecord(e)).join('')):empty)+pagination(rows.length);
  }
  function map(selected,focus) {
    const query=state().query,overview=query.get('overview')==='1'||!byId.has(focus);
    const focal=overview?null:byId.get(focus);
    focus=focal?.id;
    const expanded=query.get('depth')==='2';
    const direct=focal?edges.filter(e=>matchesReview(e)&&(e.source===focus||e.target===focus)):[];
    const neighbors=[...new Set(direct.map(e=>e.source===focus?e.target:e.source))].sort((a,b)=>byId.get(a).label.localeCompare(byId.get(b).label));
    function branch(id,relations){
      return '<li><div class="outline-name">'+entityLink(id)+' <span class="meta">['+esc(human(byId.get(id).type))+']</span> <a href="'+esc(url('map',{focus:id}))+'">[focus]</a></div>'+relations.map(e=>'<div class="outline-relation">'+edgeTitle(e)+'<details><summary>'+badge(e)+' · source</summary>'+evidence(e)+'</details></div>').join('')+'</li>';
    }
    const branches=neighbors.map(id=>{
      const relations=direct.filter(e=>e.source===id||e.target===id);
      const further=edges.filter(e=>matchesReview(e)&&(e.source===id||e.target===id)&&e.source!==focus&&e.target!==focus);
      const more=[...new Set(further.map(e=>e.source===id?e.target:e.source))].sort((a,b)=>byId.get(a).label.localeCompare(byId.get(b).label));
      let html=branch(id,relations);
      if(more.length)html=html.slice(0,-5)+'<details'+(expanded?' open':'')+'><summary>'+more.length+' further connections through '+esc(byId.get(id).label)+'</summary><p class="small muted">These are connections to '+esc(byId.get(id).label)+', not direct affiliations with '+esc(focal.label)+'.</p><ul class="outline">'+more.map(end=>branch(end,further.filter(e=>e.source===end||e.target===end))).join('')+'</ul></details></li>';
      return html;
    }).join('');
    main.innerHTML=heading(overview?'Network index':focal?focal.label+' / connection outline':'No matching entity',overview?'Choose an entity to follow its connections.':'Follow linked names or expand a branch. Each relationship keeps its direction, role, and source.',overview?selected.nodes.length+' entities':neighbors.length+' direct neighbors')+
      '<label for="map-focus">Start with<select id="map-focus"><option value="">Choose an entity…</option>'+selected.nodes.map(n=>'<option value="'+esc(n.id)+'" '+(n.id===focus?'selected':'')+'>'+esc(n.label)+'</option>').join('')+'</select></label><div class="toolbar">'+(overview?'':'<a href="'+esc(url('map',{overview:'1'}))+'">[All entities]</a> <a href="'+esc(url('map',{focus,depth:expanded?'1':'2'}))+'">['+(expanded?'Collapse further connections':'Expand one step further')+']</a>')+'</div>'+
      (overview?'<ul class="index-list">'+selected.nodes.map(n=>'<li><a href="'+esc(url('map',{focus:n.id}))+'">'+esc(n.label)+'</a> <span class="meta">'+esc(human(n.type))+'</span></li>').join('')+'</ul>':focal?'<section class="text-map" aria-label="Connection outline"><h2>'+entityLink(focus)+'</h2><ul class="outline">'+(branches||'<li>No matching relationships recorded.</li>')+'</ul></section>':empty);
    document.getElementById('map-focus').onchange=event=>{if(event.target.value)location.hash=url('map',{focus:event.target.value});};
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
  fields.forEach(k=>controls[k].addEventListener(k==='search'?'input':'change',()=>{page=0;const s=state();history.replaceState(null,'',url(s.path,{focus:s.query.get('focus'),depth:s.query.get('depth'),overview:s.query.get('overview')}));render();}));
  document.getElementById('reset').onclick=()=>{fields.forEach(k=>controls[k].value='');page=0;history.replaceState(null,'',url(state().path));render();};
  main.addEventListener('click',event=>{const layoutButton=event.target.closest('[data-layout]'),pageButton=event.target.closest('[data-page]');if(layoutButton){layout=layoutButton.dataset.layout;render();}if(pageButton&&!pageButton.disabled){page=Number(pageButton.dataset.page);render();main.focus();main.scrollIntoView({block:'start'});}});
  window.addEventListener('hashchange',readRoute);
  readRoute();
})();


(async function () {
  const data = await fetch('graph.json').then(r => r.json());
  const elements = [...data.nodes, ...data.edges];

  const cy = cytoscape({
    container: document.getElementById('cy'),
    elements,
    style: [
      { selector:'node', style:{
        'label':'data(label)',
        'font-size':9,
        'text-wrap':'wrap',
        'text-max-width':90,
        'text-valign':'bottom',
        'text-margin-y':6,
        'background-color':'#888',
        'width':22,'height':22,
        'color':'#ccc'
      }},
      { selector:'node[type="person"]', style:{ 'shape':'diamond','width':18,'height':18 }},
      { selector:'node[type="movement"]', style:{ 'shape':'round-rectangle','width':28,'height':18 }},
      { selector:'node[type="place"]', style:{ 'shape':'rectangle','width':24,'height':24 }},
      { selector:'edge', style:{
        'width':1,
        'line-color':'#555',
        'target-arrow-color':'#555',
        'target-arrow-shape':'triangle',
        'curve-style':'bezier',
        'opacity':.65
      }},
      { selector:'edge[confidence="confirmed"]', style:{'width':2,'opacity':.85}},
      { selector:'edge[confidence="contextual"]', style:{'line-style':'dashed','opacity':.45}},
      { selector:'edge[confidence="inferred"]', style:{'line-style':'dotted','opacity':.35}},
      { selector:'edge[review_status="legacy_unreviewed"]', style:{'line-color':'#806e69','target-arrow-color':'#806e69','opacity':.32}},
      { selector:'edge[review_status="audited"]', style:{'line-color':'#79b8a1','target-arrow-color':'#79b8a1'}},
      { selector:':selected', style:{'border-width':3,'border-color':'#fff','line-color':'#aaa','target-arrow-color':'#aaa'}},
      { selector:'.dim', style:{'opacity':.08,'text-opacity':.08} }
    ],
    layout: { name:'cose', animate:false, idealEdgeLength:90, nodeRepulsion:6500, gravity:.25 }
  });

  const cluster = document.getElementById('cluster');
  const clusters = [...new Set(data.nodes.map(n=>n.data.cluster).filter(Boolean))].sort();
  clusters.forEach(c => {
    const o=document.createElement('option'); o.value=c; o.textContent=c; cluster.appendChild(o);
  });

  const detail = document.getElementById('detail');
  function esc(s='') { return String(s).replace(/[&<>"]/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch])); }
  function sourceLinks(ids) {
    const items = String(ids || '').split('|').filter(Boolean).map(id => {
      const s = data.sources[id];
      if (!s || !/^https:\/\//.test(s.url)) return '<li>' + esc(id) + ' (source unavailable)</li>';
      const dates = [s.published_date && 'published ' + s.published_date,
                     s.last_checked && 'checked ' + s.last_checked].filter(Boolean).join(' · ');
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' +
        esc(id) + ' · ' + esc(s.title) + '</a>' +
        (dates ? '<br><small>' + esc(dates) + '</small>' : '') + '</li>';
    });
    return items.length ? '<h3>Sources</h3><ul class="sources">' + items.join('') + '</ul>' : '';
  }
  function show(ele) {
    const d=ele.data();
    if (ele.isNode()) {
      detail.innerHTML = `
        <div class="kicker">${esc(d.type || 'node')} · ${esc(d.cluster || '')}</div>
        <h2>${esc(d.label)}</h2>
        <p>${esc(d.summary || '')}</p>
        ${d.philosophy ? `<p><b>Stated / mapped philosophy:</b><br>${esc(d.philosophy)}</p>` : ''}
        ${d.location ? `<span class="pill">${esc(d.location)}</span>` : ''}
        ${d.sources ? `<p><b>Source IDs:</b> ${esc(d.sources)}</p>` : ''}
      `;
    } else {
      detail.innerHTML = `
        <div class="kicker">${esc(d.confidence)} relationship</div>
        <h2>${esc(d.relationship)}</h2>
        <p><b>${esc(cy.getElementById(d.source).data('label'))}</b> → <b>${esc(cy.getElementById(d.target).data('label'))}</b></p>
        <p>${esc(d.basis || '')}</p>
        <p><b>Source IDs:</b> ${esc(d.sources || '')}</p>
      `;
    }
  }
  function showProvenance(ele) {
    const d = ele.data();
    if (ele.isNode()) {
      if (d.notes) detail.insertAdjacentHTML('beforeend','<p><b>Notes:</b> ' + esc(d.notes) + '</p>');
    } else {
      const status = d.review_status === 'audited' ? 'Audited' : 'Legacy: review pending';
      detail.insertAdjacentHTML('beforeend',
        '<p><b>Review:</b> ' + esc(status) +
        (d.last_verified ? ' · checked ' + esc(d.last_verified) : '') + '</p>' +
        (d.claim_kind ? '<p><b>Claim kind:</b> ' + esc(d.claim_kind.replaceAll('_',' ')) + '</p>' : '') +
        (d.date_start || d.date_end ? '<p><b>Period:</b> ' + esc(d.date_start || 'unknown') +
          ' → ' + esc(d.date_end || 'not established') + '</p>' : '') +
        (d.amount_usd ? '<p><b>Reported USD amount:</b> $' + esc(Number(d.amount_usd).toLocaleString()) + '</p>' : '') +
        (d.source_locator ? '<p><b>Where in source:</b> ' + esc(d.source_locator) + '</p>' : '') +
        (d.caveat ? '<p><b>Does not establish:</b> ' + esc(d.caveat) + '</p>' : ''));
    }
    detail.insertAdjacentHTML('beforeend', sourceLinks(d.sources));
  }
  cy.on('tap','node, edge', e=>{
    show(e.target);
    showProvenance(e.target);
  });

  function filter() {
    const q=document.getElementById('search').value.trim().toLowerCase();
    const c=cluster.value;
    const conf=document.getElementById('confidence').value;
    const review=document.getElementById('review').value;

    cy.elements().removeClass('dim');

    if (q || c) {
      cy.nodes().forEach(n=>{
        const blob=[n.data('label'),n.data('cluster'),n.data('summary'),n.data('philosophy')].join(' ').toLowerCase();
        const matchesQ=!q || blob.includes(q);
        const matchesC=!c || n.data('cluster')===c;
        if (!(matchesQ && matchesC)) n.addClass('dim');
      });
      cy.edges().forEach(e=>{
        if (e.source().hasClass('dim') || e.target().hasClass('dim')) e.addClass('dim');
      });
    }
    if (conf) {
      cy.edges().forEach(e=>{ if (e.data('confidence')!==conf) e.addClass('dim'); });
    }
    if (review) {
      cy.edges().forEach(e=>{ if (e.data('review_status')!==review) e.addClass('dim'); });
    }
  }

  document.getElementById('search').addEventListener('input',filter);
  cluster.addEventListener('change',filter);
  document.getElementById('confidence').addEventListener('change',filter);
  document.getElementById('review').addEventListener('change',filter);
  document.getElementById('reset').addEventListener('click',()=>{
    document.getElementById('search').value='';
    cluster.value='';
    document.getElementById('confidence').value='';
    document.getElementById('review').value='';
    cy.elements().removeClass('dim');
    cy.fit(undefined,40);
  });
})();

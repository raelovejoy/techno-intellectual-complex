
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
  cy.on('tap','node, edge', e=>show(e.target));

  function filter() {
    const q=document.getElementById('search').value.trim().toLowerCase();
    const c=cluster.value;
    const conf=document.getElementById('confidence').value;

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
  }

  document.getElementById('search').addEventListener('input',filter);
  cluster.addEventListener('change',filter);
  document.getElementById('confidence').addEventListener('change',filter);
  document.getElementById('reset').addEventListener('click',()=>{
    document.getElementById('search').value='';
    cluster.value='';
    document.getElementById('confidence').value='';
    cy.elements().removeClass('dim');
    cy.fit(undefined,40);
  });
})();

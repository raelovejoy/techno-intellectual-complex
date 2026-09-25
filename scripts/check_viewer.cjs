// Runtime smoke checks with the real dataset and a minimal DOM adapter.
// This checks routing/filter behavior, not browser rendering or graph layout.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const graph=JSON.parse(fs.readFileSync('docs/graph.json','utf8'));
class Element {
  constructor(){this.value='';this.innerHTML='';this.dataset={};this.listeners={};this.options=[];}
  addEventListener(event,cb){this.listeners[event]=cb;}
  add(option){this.options.push(option);}
  setAttribute(k,v){this[k]=v;}
  removeAttribute(k){delete this[k];}
  getAttribute(k){return this[k];}
  focus(){} scrollIntoView(){}
}
const ids=['content','search','cluster','type','review','confidence','theme','reset','dataset-status','cy','fit-map','zoom-in','zoom-out','map-detail'];
const elements=Object.fromEntries(ids.map(k=>[k,new Element()]));
const nav=['directory','map','relationships','funding','sources','method'].map(k=>Object.assign(new Element(),{href:'#'+k}));
const listeners={},location={hash:'#directory'},document={getElementById:id=>{assert.ok(elements[id],id);return elements[id];},querySelectorAll:()=>nav,documentElement:{dataset:{}},title:''};
let mapElements=[];
const context={document,location,history:{replaceState:(_,__,hash)=>{location.hash=hash;}},window:{addEventListener:(e,cb)=>listeners[e]=cb},localStorage:{getItem:()=>null,setItem:()=>{}},matchMedia:()=>({matches:false}),URLSearchParams,Option:function(label,value){this.label=label;this.value=value;},fetch:async()=>({ok:true,json:async()=>graph}),getComputedStyle:()=>({getPropertyValue:()=> '#ccc'}),cytoscape:options=>{mapElements=options.elements;return {destroy(){},on(){},fit(){},zoom(){return 1;},width(){return 500;},height(){return 500;}};}};
function route(hash){location.hash=hash;listeners.hashchange();}
(async()=>{
  await vm.runInNewContext(fs.readFileSync('docs/app.js','utf8'),context);
  assert.match(elements.content.innerHTML,/112 entities/);
  elements.search.value='Lightcone';elements.search.listeners.input();
  assert.match(elements.content.innerHTML,/Lightcone/);
  assert.ok(!elements.content.innerHTML.includes('Vivarium SF'));
  assert.match(location.hash,/search=Lightcone/);
  route('#entity/lightcone');assert.match(elements.content.innerHTML,/Connections/);assert.match(elements.content.innerHTML,/Source|sources/);
  for(const n of graph.nodes){route('#entity/'+encodeURIComponent(n.data.id));assert.ok(elements.content.innerHTML.includes('Complete dossier'));}
  route('#entity/unknown');assert.match(elements.content.innerHTML,/Entity not found/);
  route('#entity/%ZZ');assert.match(elements.content.innerHTML,/Entity not found/);
  route('#map?focus=lightcone');assert.ok(mapElements.some(x=>x.data.id==='lightcone'));assert.ok(mapElements.some(x=>x.data.id==='ai-2040-plan-a'));
  route('#relationships?review=audited');assert.match(elements.content.innerHTML,/13 records/);assert.ok(!elements.content.innerHTML.includes('Review pending'));
  route('#funding?review=audited');assert.match(elements.content.innerHTML,/500,000/);assert.match(elements.content.innerHTML,/not confirmed payments/);assert.match(elements.content.innerHTML,/Not recorded/);
  route('#sources');assert.match(elements.content.innerHTML,/113 sources/);
  route('#method');assert.match(elements.content.innerHTML,/109 relationships/);
  route('#directory?search=zzzzzzzz');assert.match(elements.content.innerHTML,/No records match/);
  elements.reset.onclick();assert.match(elements.content.innerHTML,/112 entities/);
  elements.content.listeners.click({target:{closest:s=>s==='[data-layout]'?{dataset:{layout:'table'}}:null}});assert.match(elements.content.innerHTML,/<table>/);
  elements.content.listeners.click({target:{closest:s=>s==='[data-page]'?{dataset:{page:'1'},disabled:false}:null}});assert.match(elements.content.innerHTML,/Page 2/);
  elements.theme.listeners.click();assert.equal(document.documentElement.dataset.theme,'light');
  console.log('Viewer smoke checks passed: all dossiers, routes, filters, funding, map data, pagination, theme.');
})().catch(e=>{console.error(e);process.exitCode=1;});

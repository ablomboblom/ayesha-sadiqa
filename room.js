function esc(s=''){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function simpleMarkdown(s=''){return esc(s).split(/\n\n+/).map(p=>'<p>'+p.replace(/\n/g,'<br>')+'</p>').join('')}
function latestFirst(arr){return [...(arr||[])].sort((a,b)=>String(b.date).localeCompare(String(a.date)))}
function entryHtml(type,x){
  const date=esc(String(x.date||'').slice(0,10));
  if(type==='reading') return '<article class="entry"><div class="date">'+date+' · reading note</div><h2>'+esc(x.title)+'</h2>'+simpleMarkdown(x.body)+'</article>';
  if(type==='wins') return '<article class="entry"><div class="date">'+date+'</div><h2>'+esc(x.title)+'</h2>'+simpleMarkdown(x.body)+(x.tags?.length?'<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:20px">'+x.tags.map(t=>'<span style="padding:9px 12px;border-radius:999px;background:rgba(255,255,255,.55);font-size:12px">'+esc(t)+'</span>').join('')+'</div>':'')+'</article>';
  if(type==='prompts') return '<article class="entry"><div class="date">'+date+' · writing prompt</div><h2>'+esc(x.title)+'</h2>'+(x.lines||[]).map(l=>'<p style="margin:.4em 0">'+esc(l)+'</p>').join('')+'</article>';
  if(type==='stories') return '<article class="entry"><div class="date">'+date+' · '+esc(x.type||'story')+'</div><h2>'+esc(x.title)+'</h2><p>'+esc(x.excerpt||'')+'</p>'+(x.body?simpleMarkdown(x.body):'')+(x.pdf?'<p><a class="back" style="display:inline-block;margin-top:12px" href="'+esc(x.pdf)+'" target="_blank" rel="noopener">open PDF ↗</a></p>':'')+'</article>';
  return '<article class="entry"><div class="date">'+date+'</div><h2>'+esc(x.title)+'</h2>'+simpleMarkdown(x.body)+'</article>';
}
function renderCalendar(items){
  const cal=document.querySelector('.calendar'); if(!cal) return;
  const dated=(items||[]).map(x=>String(x.date||'').slice(0,10)).filter(Boolean).sort();
  const base=dated[dated.length-1]||new Date().toISOString().slice(0,10);
  const d=new Date(base+'T00:00:00');
  const year=d.getFullYear(), month=d.getMonth();
  const monthName=d.toLocaleString('en',{month:'long'});
  const days=new Date(year,month+1,0).getDate();
  const first=(new Date(year,month,1).getDay()+6)%7;
  const hits=new Set(dated.filter(x=>x.startsWith(year+'-'+String(month+1).padStart(2,'0'))).map(x=>Number(x.slice(8,10))));
  let cells=['M','T','W','T','F','S','S'].map(x=>'<span class="muted">'+x+'</span>');
  for(let i=0;i<first;i++)cells.push('<span></span>');
  for(let day=1;day<=days;day++)cells.push('<span class="'+(hits.has(day)?'has':'')+'">'+day+'</span>');
  cal.innerHTML='<div class="calhead"><strong>'+monthName+' '+year+'</strong><span>✦</span></div><div class="calgrid">'+cells.join('')+'</div><p class="legend">✦ dates with something tucked inside them</p>';
}
(async function(){
  try{
    const data=await fetch('/content/content.json',{cache:'no-store'}).then(r=>r.json());
    const path=location.pathname;
    let type='thoughts', items=data.thoughts||[];
    if(path.includes('all-about-love')){type='reading';items=data.reading?.notes||[]}
    else if(path.includes('what-i-learned')){type='lessons';items=data.lessons||[]}
    else if(path.includes('todays-thought')){type='thoughts';items=data.thoughts||[]}
    else if(path.includes('/wins')){type='wins';items=data.wins||[]}
    else if(path.includes('/stories')){type='stories';items=data.stories||[]}
    else if(path.includes('/writing-room')){type='prompts';items=data.prompts||[]}
    items=latestFirst(items);
    const holder=document.getElementById('entries');
    if(holder&&items.length)holder.innerHTML=items.map(x=>entryHtml(type,x)).join('');
    renderCalendar(items);
  }catch(e){console.warn('Archive is using built-in fallback content',e)}
})();
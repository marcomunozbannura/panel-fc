/* ============================================================
   GP Apps · núcleo JS · Grupo Progestion
   Utilidades + gráficos SVG + shell + motor "Actualizar"
   Requiere: window.__DB__ y window.__META__ (data.js) cargados antes.
   ============================================================ */
(function(){
const GP = window.GP = window.GP || {};   // no clobbea GP.icon si icons.js cargó antes

/* ---------------- utils ---------------- */
const $  = GP.$  = (s,r)=> (r||document).querySelector(s);
const $$ = GP.$$ = (s,r)=> [...(r||document).querySelectorAll(s)];
const sum  = GP.sum  = (a,f)=> a.reduce((s,x)=>s+(f?(f(x)||0):(x||0)),0);
const uniq = GP.uniq = a=> [...new Set(a)].filter(x=>x!=null&&x!=='').sort((a,b)=>(''+a).localeCompare(''+b,'es'));
const fmt0 = GP.fmt0 = n=> Math.round(n||0).toLocaleString('es-CL');
const money= GP.money= n=> '$'+fmt0(n);
const mm   = GP.mm   = n=>{const v=(n||0)/1e6; return '$'+v.toLocaleString('es-CL',{minimumFractionDigits:1,maximumFractionDigits:1})+' mill.';};
const mAxis= GP.mAxis= n=>{const v=(n||0)/1e6; return (Math.abs(v)>=1000)?('$'+(v/1000).toFixed(1)+'MM'):('$'+Math.round(v)+'M');};
const pct  = GP.pct  = (a,b)=> b?(100*a/b).toLocaleString('es-CL',{minimumFractionDigits:1,maximumFractionDigits:1})+'%':'—';
const pctN = GP.pctN = (a,b)=> b?(100*a/b):0;
const esc  = GP.esc  = s=> (''+(s==null?'':s)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp= GP.clamp= (n,a,b)=> Math.max(a,Math.min(b,n));
const MES  = GP.MES  = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const MESF = GP.MESF = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
GP.nowStr = ()=> new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
GP.yearOf = r=> r.emision?r.emision.slice(0,4):(r.mesServicio?r.mesServicio.slice(0,4):null);   // por EMISIÓN (pedido de Marco)
GP.monthOf= iso=> iso? (+iso.slice(5,7)) : 0;
GP.parseD = iso=>{ if(!iso||!/^\d{4}-\d\d-\d\d/.test(iso))return null; const d=new Date(iso+'T00:00:00'); return isNaN(d)?null:d; };
GP.daysB  = (a,b)=>{ const x=GP.parseD(a),y=GP.parseD(b); return (x&&y)?Math.round((y-x)/86400000):null; };
GP.fdate  = iso=>{ const d=GP.parseD(iso); return d? (d.getDate()+' '+MES[d.getMonth()]+' '+d.getFullYear()):(iso||'—'); };
GP.isCierre=r=> r.status==='CIERRE';
GP.isProy = r=> r.status==='PROYECTADO';
GP.isMora = r=> /^\d\.\sMora/.test(r.estadoMora||'');
GP.isPagada=r=> r.estadoMora==='Pagada';
GP.agg = (arr,key,val)=>{const m={};arr.forEach(r=>{const k=(typeof key==='function'?key(r):r[key])||'(sin)';m[k]=(m[k]||0)+(val?(val(r)||0):1);});return Object.entries(m).map(([k,v])=>({k,v})).sort((a,b)=>b.v-a.v);};
GP.color = v=> getComputedStyle(document.body).getPropertyValue(v.replace('var(','').replace(')','').trim())||v;
// móvil: ancho de pantalla <768px (para gráficos/hbars responsivos)
const isMobile = GP.isMobile = ()=>{ try{ return window.matchMedia('(max-width:767px)').matches; }catch(e){ return (window.innerWidth||9999)<768; } };

/* ---------------- tooltip global ---------------- */
let TIP;
function initTip(){ if(TIP)return; TIP=document.createElement('div'); TIP.className='chart-tip'; document.body.appendChild(TIP);
  document.addEventListener('mouseover',e=>{ const t=e.target.closest('[data-tip]'); if(t){ TIP.innerHTML=t.getAttribute('data-tip'); TIP.style.opacity=1; } });
  document.addEventListener('mousemove',e=>{ if(TIP.style.opacity==='1'){ let x=e.clientX+14,y=e.clientY+14; if(x+TIP.offsetWidth>innerWidth)x=e.clientX-TIP.offsetWidth-12; if(y+TIP.offsetHeight>innerHeight)y=e.clientY-TIP.offsetHeight-12; TIP.style.left=x+'px'; TIP.style.top=y+'px'; } });
  document.addEventListener('mouseout',e=>{ if(e.target.closest('[data-tip]'))TIP.style.opacity=0; });
}

/* ---------------- charts ---------------- */
GP.donut = function(segs,opts={}){
  const size=opts.size||140, r=size/2, ir=r*(opts.ir||0.68);
  const tot=sum(segs,s=>s.value)||1; let a=-Math.PI/2, p='';
  segs.forEach(s=>{ if(s.value<=0)return; const ang=2*Math.PI*s.value/tot, b=a+ang;
    const x1=r+r*Math.cos(a),y1=r+r*Math.sin(a),x2=r+r*Math.cos(b),y2=r+r*Math.sin(b);
    const xi2=r+ir*Math.cos(b),yi2=r+ir*Math.sin(b),xi1=r+ir*Math.cos(a),yi1=r+ir*Math.sin(a);
    const lg=ang>Math.PI?1:0;
    p+=`<path d="M${x1} ${y1} A${r} ${r} 0 ${lg} 1 ${x2} ${y2} L${xi2} ${yi2} A${ir} ${ir} 0 ${lg} 0 ${xi1} ${yi1} Z" fill="${s.color}" data-tip="<b>${esc(s.label)}</b><br>${(opts.tip||money)(s.value)} · ${pct(s.value,tot)}" style="cursor:pointer"/>`; a=b; });
  const ctr = opts.center? `<div class="ctr"><b>${opts.center}</b>${opts.centerSub?`<small>${opts.centerSub}</small>`:''}</div>`:'';
  return `<div class="donut-c" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${p}</svg>${ctr}</div>`;
};
GP.legendList = function(segs,tot){ tot=tot||sum(segs,s=>s.value)||1;
  return `<div style="flex:1">${segs.map(s=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;border-bottom:1px solid var(--line2)"><span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:${s.color};margin-right:8px"></i>${esc(s.label)}</span><b>${pct(s.value,tot)}</b></div>`).join('')}</div>`;
};
GP.hbars = function(items,opts={}){
  const max=Math.max(1,...items.map(i=>i.value)); const fmt=opts.fmt||(isMobile()?mAxis:mm);
  if(!items.length) return `<div class="empty"><div class="e-ic">${GP.icon?GP.icon('bars',32):''}</div>Sin datos para el filtro actual</div>`;
  // En móvil (<768px) las columnas fijas (label + valor) ahogan la barra; usar columnas flexibles
  // que garantizan un ancho útil de barra (>=90px) sin desbordar horizontalmente.
  const mob=isMobile();
  const cols = mob ? 'minmax(56px,34%) minmax(0,1fr) auto'   // barra encoge (minmax(0,1fr)) -> nunca desborda
                   : ((opts.labelW||160)+'px 1fr 100px');
  const lfs = mob?'11px':'11.5px', vfs = mob?'11px':'11.5px';
  return '<div style="display:flex;flex-direction:column;gap:9px">'+items.map(i=>`
    <div style="display:grid;grid-template-columns:${cols};align-items:center;gap:10px">
      <div style="font-size:${lfs};white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(i.label)}">${esc(i.label)}</div>
      <div style="background:#0b1119;border-radius:5px;height:16px;overflow:hidden" data-tip="<b>${esc(i.label)}</b><br>${fmt(i.value)}">
        <div style="height:100%;width:${100*i.value/max}%;background:${i.color||'linear-gradient(90deg,#22d3ee,#3b82f6)'};border-radius:5px;transition:width .5s"></div></div>
      <div style="text-align:right;font-size:${vfs};font-variant-numeric:tabular-nums" class="muted">${fmt(i.value)}</div>
    </div>`).join('')+'</div>';
};
GP.stackBars = function(months,opts={}){ // months:[{m,parts:[{v,color,label}]}]
  const H=opts.h||190, BW=opts.bw||30, GAP=16, step=BW+GAP;
  const max=Math.max(1,...months.map(mo=>sum(mo.parts,p=>p.v)));
  const W=months.length*step+8;
  let bars='';
  months.forEach((mo,i)=>{ let y=H,x=i*step+8; const tot=sum(mo.parts,p=>p.v);
    const tipF=opts.tip||money;
    mo.parts.forEach(p=>{ if(p.v<=0)return; const h=H*p.v/max; y-=h;
      bars+=`<rect x="${x}" y="${y}" width="${BW}" height="${h}" fill="${p.color}" data-tip="<b>${esc(mo.m)}</b> · ${esc(p.label||'')}<br>${tipF(p.v)}"/>`; });
    bars+=`<text x="${x+BW/2}" y="${H+16}" fill="#8493a6" font-size="10" text-anchor="middle">${esc(mo.m)}</text>`;
    if(tot>0&&opts.totals!==false)bars+=`<text x="${x+BW/2}" y="${H-H*tot/max-5}" fill="#c7d2df" font-size="9.5" text-anchor="middle" font-weight="600">${mAxis(tot)}</text>`;
  });
  return `<svg width="100%" height="${H+26}" viewBox="0 0 ${W} ${H+26}" preserveAspectRatio="xMidYMid meet" style="overflow:visible">${bars}</svg>`;
};
GP.lineChart = function(series,xLabels,opts={}){ // series:[{label,color,values:[]}]
  const W=opts.w||(isMobile()?400:760), H=opts.h||230, PL=48, PR=16, PT=14, PB=26;
  const iw=W-PL-PR, ih=H-PT-PB;
  const all=series.flatMap(s=>s.values.filter(v=>v!=null));
  let mx=Math.max(1,...all), mn=opts.zero===false?Math.min(0,...all):0;
  const rng=(mx-mn)||1; mx+=rng*0.08;
  const n=xLabels.length;
  const X=i=> PL + (n<=1?iw/2:iw*i/(n-1));
  const Y=v=> PT + ih - ih*(v-mn)/(mx-mn);
  let grid='',ax='';
  const ticks=4;
  const axF=opts.axisFmt||mAxis, tipF=opts.tip||money;   // eje abreviado; tooltip exacto (configurable)
  for(let t=0;t<=ticks;t++){ const val=mn+(mx-mn)*t/ticks, y=Y(val);
    grid+=`<line class="gl" x1="${PL}" y1="${y}" x2="${W-PR}" y2="${y}"/>`;
    ax+=`<text x="${PL-8}" y="${y+3}" fill="#5a6675" font-size="9.5" text-anchor="end">${axF(val)}</text>`; }
  xLabels.forEach((lb,i)=>{ if(n>14 && i%2) return; ax+=`<text x="${X(i)}" y="${H-8}" fill="#8493a6" font-size="9.5" text-anchor="middle">${esc(lb)}</text>`; });
  let lines='',dots='';
  series.forEach((s,si)=>{
    let d='',started=false;
    s.values.forEach((v,i)=>{ if(v==null)return; const cmd=started?'L':'M'; d+=`${cmd}${X(i).toFixed(1)} ${Y(v).toFixed(1)} `; started=true; });
    if(opts.area){ const first=s.values.findIndex(v=>v!=null); let last=0; s.values.forEach((v,i)=>{if(v!=null)last=i;});
      lines+=`<path d="${d}L${X(last)} ${Y(mn)} L${X(first)} ${Y(mn)} Z" fill="${s.color}" opacity=".08"/>`; }
    lines+=`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
    s.values.forEach((v,i)=>{ if(v==null)return; const dc=opts.click?` class="lcpt" data-s="${si}" data-i="${i}"`:'';
      if(opts.click) dots+=`<circle cx="${X(i)}" cy="${Y(v)}" r="12" fill="transparent"${dc} style="cursor:pointer"/>`;
      dots+=`<circle cx="${X(i)}" cy="${Y(v)}" r="3.8" fill="#0b1119" stroke="${s.color}" stroke-width="2"${dc} data-tip="<b>${esc(s.label)}</b> · ${esc(xLabels[i])}<br>${tipF(v)}${opts.click?'<br><span style=&quot;color:#8493a6&quot;>clic para ver áreas</span>':''}" style="cursor:pointer"/>`; });
  });
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;aspect-ratio:${W} / ${H};overflow:visible">${grid}${lines}${dots}${ax}</svg>`;
};
// escalón "redondo" para ejes (1,2,5 × 10ⁿ) — ejes legibles en días/unidades
GP.niceStep = function(rough){ if(rough<=0)return 1; const p=Math.pow(10,Math.floor(Math.log10(rough))); const n=rough/p; const s=n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10; return s*p; };
GP.groupedBars = function(cats,series,opts={}){ // cats:[labels]; series:[{label,color,values:[]}]
  const W=opts.w||(isMobile()?400:760),H=opts.h||230,PL=44,PR=12,PT=opts.valLabels?22:12,PB=opts.rotateX?70:28; const iw=W-PL-PR,ih=H-PT-PB;
  const rawMx=Math.max(1,...series.flatMap(s=>s.values));
  const ticks=opts.ticks||4;
  // eje con marcas redondas (opts.niceAxis) — sin tanto rango vacío, más detalle
  const step=opts.niceAxis?GP.niceStep(rawMx/ticks):(rawMx*1.08/ticks);
  const mx=step*ticks;
  const gStep=iw/cats.length, bw=Math.min(opts.bw||26,(gStep-8)/series.length);
  let grid='',bars='',ax='';
  const axF=opts.axisFmt||mAxis, tipF=opts.tip||money;
  const catFull=opts.catFull||cats;   // etiqueta completa para el tooltip
  const barLbl=opts.barLabel;          // fn(v)->texto exacto sobre la barra
  for(let t=0;t<=ticks;t++){ const val=mx*t/ticks,y=PT+ih-ih*t/ticks; grid+=`<line class="gl" x1="${PL}" y1="${y}" x2="${W-PR}" y2="${y}"/>`; ax+=`<text x="${PL-7}" y="${y+3}" fill="#6b7a8c" font-size="9.5" text-anchor="end">${axF(val)}</text>`; }
  cats.forEach((c,ci)=>{ const gx=PL+ci*gStep+(gStep-bw*series.length)/2;
    series.forEach((s,si)=>{ const v=s.values[ci]||0,h=ih*v/mx,x=gx+si*bw,y=PT+ih-h;
      bars+=`<rect x="${x}" y="${y}" width="${bw-3}" height="${Math.max(0,h)}" rx="2" fill="${s.color}" data-tip="<b>${esc(catFull[ci])}</b> · ${esc(s.label)}<br>${tipF(v)}"/>`;
      if(barLbl && v>0){
        // 2 series: etiquetas ancladas HACIA AFUERA (izq. la 1ª, der. la última) para que NO se traspongan
        let anc='middle', lx=x+(bw-3)/2;
        if(series.length===2){ if(si===0){ anc='end'; lx=x+(bw-3); } else { anc='start'; lx=x; } }
        bars+=`<text x="${lx.toFixed(1)}" y="${y-4}" fill="${s.color}" font-size="8" font-weight="700" text-anchor="${anc}">${esc(barLbl(v))}</text>`;
      } });
    const cx=PL+ci*gStep+gStep/2;
    ax+= opts.rotateX
      ? `<text x="${cx}" y="${H-PB+14}" fill="#a3b0c0" font-size="9.5" text-anchor="end" transform="rotate(-30 ${cx} ${H-PB+14})">${esc(c)}</text>`
      : `<text x="${cx}" y="${H-9}" fill="#8493a6" font-size="9.5" text-anchor="middle">${esc(c)}</text>`; });
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;aspect-ratio:${W} / ${H};overflow:visible">${grid}${bars}${ax}</svg>`;
};
GP.waterfall = function(steps,opts={}){ // steps:[{label,value,type:'base'|'up'|'down'|'total'}]
  const mob=isMobile(); const fsLab=mob?12:9, fsVal=mob?11.5:9.5;
  const W=opts.w||(mob?400:760),H=opts.h||250,PL=52,PR=12,PT=14,PB=44; const iw=W-PL-PR,ih=H-PT-PB;
  let run=0; const pts=steps.map(s=>{ let lo,hi; if(s.type==='total'||s.type==='base'){lo=0;hi=s.value;run=s.value;} else if(s.type==='up'){lo=run;hi=run+s.value;run+=s.value;} else {lo=run+s.value;hi=run;run+=s.value;} return {...s,lo,hi}; });
  const mx=Math.max(1,...pts.map(p=>p.hi))*1.1, mn=Math.min(0,...pts.map(p=>p.lo));
  const Y=v=>PT+ih-ih*(v-mn)/(mx-mn);
  const step=iw/steps.length, bw=Math.min(opts.bw||46,step-16);
  const col={base:'#60a5fa',up:'#34d399',down:'#f87171',total:'#22d3ee'};
  let grid='',bars='',ax='';
  for(let t=0;t<=4;t++){ const val=mn+(mx-mn)*t/4,y=Y(val); grid+=`<line class="gl" x1="${PL}" y1="${y}" x2="${W-PR}" y2="${y}"/>`; ax+=`<text x="${PL-8}" y="${y+3}" fill="#5a6675" font-size="9.5" text-anchor="end">${mAxis(val)}</text>`; }
  pts.forEach((p,i)=>{ const x=PL+i*step+(step-bw)/2, yTop=Y(Math.max(p.lo,p.hi)), h=Math.abs(Y(p.lo)-Y(p.hi));
    bars+=`<rect x="${x}" y="${yTop}" width="${bw}" height="${Math.max(1,h)}" rx="2" fill="${p.color||col[p.type]}" data-tip="<b>${esc(p.label)}</b><br>${mm(p.value)}"/>`;
    bars+=`<text x="${x+bw/2}" y="${yTop-5}" fill="#c7d2df" font-size="${fsVal}" text-anchor="middle" font-weight="600">${mAxis(p.value)}</text>`;
    const words=(''+p.label).split(' '); let line1=p.label,line2='';
    if(p.label.length>10 && words.length>1){ const mid=Math.ceil(words.length/2); line1=words.slice(0,mid).join(' '); line2=words.slice(mid).join(' '); }
    ax+=`<text x="${x+bw/2}" y="${H-24}" fill="#8493a6" font-size="${fsLab}" text-anchor="middle">${esc(line1)}</text>`+(line2?`<text x="${x+bw/2}" y="${H-13}" fill="#8493a6" font-size="${fsLab}" text-anchor="middle">${esc(line2)}</text>`:'');
  });
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;aspect-ratio:${W} / ${H};overflow:visible">${grid}${bars}${ax}</svg>`;
};
GP.spark = function(vals,color,w,h){ w=w||110;h=h||30; const mx=Math.max(1,...vals),mn=Math.min(0,...vals);
  const X=i=>vals.length<=1?w/2:w*i/(vals.length-1), Y=v=>h-((v-mn)/((mx-mn)||1))*h;
  let d=vals.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  return `<svg width="${w}" height="${h}" style="vertical-align:middle"><path d="${d}" fill="none" stroke="${color||'#22d3ee'}" stroke-width="1.8"/></svg>`;
};

/* ---------------- datos ---------------- */
GP.DB=[]; GP.META={}; GP.FLUJO=null;
GP.loadFlujo = function(){ return fetch('/data/data_flujo.json?t='+Date.now()).then(r=>r.ok?r.json():null).then(j=>{GP.FLUJO=j;return j;}).catch(()=>null); };
GP.reloadData = function(cb){
  const s=document.createElement('script'); s.src='data/data.js?t='+Date.now();
  s.onload=()=>{ GP.DB=window.__DB__||[]; GP.META=window.__META__||{}; GP.loadFlujo().then(()=>cb&&cb(true)); };
  s.onerror=()=>cb&&cb(false); document.body.appendChild(s);
};

/* ---------------- fuente / freshness ---------------- */
const ICO=(n,s)=> (GP.icon?GP.icon(n,s||16):'');
GP.srcRow=(label,file,fecha,color)=>`<div class="srcrow" style="border-left-color:${color}">
  <div class="ico" style="color:${color}">${ICO('doc',18)}</div><div style="flex:1;min-width:0"><div class="lb">${esc(label)}</div>
  <div class="nm" title="${esc(file)}">${esc(file||'—')}</div></div>
  <div style="text-align:right;white-space:nowrap"><div class="lb" style="margin-bottom:3px">Modificado</div>${GP.freshTag(fecha)}</div></div>`;
GP.freshTag=ds=>{ if(!ds)return '<span class="chip c-gray">—</span>'; const d=new Date(ds.replace(' ','T')); if(isNaN(d))return `<span class="chip c-gray">${esc(ds)}</span>`;
  const t=new Date();t.setHours(0,0,0,0); const dd=new Date(d);dd.setHours(0,0,0,0); const days=Math.round((t-dd)/86400000),hm=ds.slice(11,16);
  if(days<=0)return `<span class="chip c-green">${ICO('check',12)} hoy ${hm}</span>`; if(days===1)return `<span class="chip c-amber">ayer ${hm}</span>`;
  return `<span class="chip ${days<=3?'c-amber':'c-red'}">hace ${days} días</span>`; };
// Panel grande: conservado por compatibilidad de API, pero el shell YA NO lo inyecta.
GP.sourcePanel=function(){ const M=GP.META;
  return `<div class="panel" style="margin-top:0;margin-bottom:14px">
   <h3>${ICO('folder',15)} Estado de las fuentes</h3><div class="ph">Excel de origen · el motor procesa siempre el más reciente</div>
   <div class="split">${GP.srcRow('Estado de Facturación Diaria',M.estadoArchivo,M.estadoFecha,'var(--purple)')}${GP.srcRow('Informe Ingreso · Libro de Ingresos',M.ingresoArchivo,M.ingresoFecha,'var(--cyan)')}</div>
   <div class="muted" style="font-size:11px;margin-top:11px;line-height:1.6">Datos procesados por el motor: <b style="color:var(--txt)">${esc(M.generadoEl)||'—'}</b>. El botón <b style="color:var(--txt)">Actualizar y abrir informe</b> vuelve a leer los Excel fuente y reconstruye todos los informes.</div></div>`;
};
// Chip discreto de la topbar: última actualización + popover con las 2 fuentes.
GP.freshChip=function(){ const M=GP.META; const hm=(M.generadoEl||'').slice(11,16)||'—';
  return `<div class="freshchip" id="freshChip" tabindex="0" role="button" aria-label="Estado de actualización de datos">
    ${ICO('clock',14)}<span class="fchtxt"><span class="fchlbl">Actualizado </span><b>${esc(hm)}</b></span>
    <div class="freshpop" id="freshPop">
      <div class="pt">${ICO('folder',13)} Excel fuente del motor</div>
      ${GP.srcRow('Estado de Facturación Diaria',M.estadoArchivo,M.estadoFecha,'var(--purple)')}
      ${GP.srcRow('Informe Ingreso · Libro de Ingresos',M.ingresoArchivo,M.ingresoFecha,'var(--cyan)')}
      <div class="pf">Motor procesado el <b>${esc(M.generadoEl)||'—'}</b>. Usa <b>Actualizar y abrir informe</b> para releer las fuentes.</div>
    </div></div>`;
};

/* ---------------- shell ---------------- */
// Mapa empresa->archivo de logo (compartido). EFICITY sin logo (no se muestra).
const LOGOS=GP.LOGOS={'PROGESTION':'emp-progestion','DISECOM':'emp-disecom','ENSTI':'emp-ensti','CRECE':'emp-crece',
  'AUDISIS LTDA':'emp-audisis','MEDICAL TALENT':'emp-medical-talent','CONSULTORA MAP':'emp-map',
  'T. SAN JESUS':'emp-transpro','TRANSPRO':'emp-transpro'};
// logos BLANCOS (para tablas/paneles sobre fondo oscuro). EFICITY sin logo.
const LOGOSW=GP.LOGOSW={'PROGESTION':'emp-progestion-w','DISECOM':'emp-disecom-w','ENSTI':'emp-ensti-w','CRECE':'emp-crece-w',
  'AUDISIS LTDA':'emp-audisis-w','MEDICAL TALENT':'emp-medical-talent-w','CONSULTORA MAP':'emp-map-w',
  'T. SAN JESUS':'emp-transpro-w','TRANSPRO':'emp-transpro-w'};
const OTHERAPPS=[
  {key:'facturacion',label:'Facturación',color:'var(--cyan)',file:'facturacion.html',icon:'receipt'},
  {key:'cobranza',label:'Cobranza · Mora',color:'var(--amber)',file:'cobranza.html',icon:'coins'},
  {key:'factoring',label:'Factoring · Caja',color:'var(--green)',file:'factoring.html',icon:'cycle'}
];

// redimensionador de la 1ª columna en las tablas .gtab (arrastrar el borde derecho del encabezado)
GP.wireTables=function(root){
  (root||document).querySelectorAll('table.gtab').forEach(tb=>{
    const th=tb.querySelector('thead th:first-child'); if(!th||th.dataset.rz)return; th.dataset.rz='1';
    const h=document.createElement('span'); h.className='colrz'; h.title='Arrastra para ajustar el ancho';
    th.appendChild(h);
    h.addEventListener('mousedown',e=>{ e.preventDefault(); e.stopPropagation(); const sx=e.clientX, sw=th.offsetWidth;
      const mv=ev=>{ const w=Math.max(76,sw+(ev.clientX-sx)); tb.style.setProperty('--c1',w+'px'); };
      const up=()=>{ document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up); document.body.style.userSelect=''; };
      document.body.style.userSelect='none'; document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up); });
  });
};

GP.app = function(cfg){
  initTip();
  const KEY='gpapp_'+cfg.key;
  document.body.style.setProperty('--accent','var('+cfg.accent+')');
  const flt = cfg.filters || ['anio','empresa','area','cliente'];
  const F = {anio:'2026',mes:[],area:[],empresa:'Todas',cliente:'Todas'};
  if(cfg.filterDefaults) Object.assign(F,cfg.filterDefaults);
  let V = cfg.nav[0].v;
  try{ const s=JSON.parse(localStorage.getItem(KEY)); if(s){ V=s.V||V; Object.assign(F,s.F||{}); } }catch(e){}
  if(!Array.isArray(F.mes)) F.mes=[];      // saneo (el formato viejo era string)
  if(!Array.isArray(F.area)) F.area=[];
  const save=()=>{ try{ localStorage.setItem(KEY,JSON.stringify({V,F})); }catch(e){} };

  // build shell
  const sideLinks = OTHERAPPS.filter(a=>a.key!==cfg.key).map(a=>`<a class="applink" href="${a.file}"><span class="ai" style="color:${a.color}">${GP.icon?GP.icon(a.icon,17):''}</span>${esc(a.label)}</a>`).join('');
  const icoMark = GP.icon? GP.icon(cfg.icon||'dashboard',20) : '';
  document.body.innerHTML=`
  <div class="app">
    <div class="top">
      <div class="brand"><div class="gplogo"><img src="_Aplicaciones/_assets/logos/gp-color.png" alt="Grupo Progestion" onerror="this.style.display='none'"></div>
        <div class="vline"></div>
        <div class="app-id"><div class="app-mark">${icoMark}</div><div><b>${esc(cfg.title)}</b><span>${esc(cfg.subtitle||'')}</span></div></div></div>
      <div id="empBadge" class="empbadge"></div>
      <div class="pulse">
        <div class="stat"><small>Datos al</small><b id="updTime">—</b></div>
        <div class="stat"><small>revisado</small><b id="readTime">—</b></div>
        <span class="live"><span class="dot"></span> en vivo</span>
        <span id="freshWrap">${GP.freshChip()}</span>
        <button class="btn primary" id="btnUpd" title="Re-lee los Excel fuente y reconstruye todos los informes"><span class="spin"></span><span class="ic">${GP.icon?GP.icon('refresh',15):''}</span> <span class="btxt">Actualizar y abrir informe</span></button>
      </div>
    </div>
    <div class="side">
      <div class="navlbl">${esc(cfg.navlbl||'Tablero')}</div>
      <div id="navbox"></div>
      <div class="navlbl" style="margin-top:14px">Otras apps</div>
      <div class="applinks">${sideLinks}</div>
      <div class="foot" id="sideFoot"></div>
    </div>
    <div class="main" id="main"></div>
    <nav class="bottomnav" id="bottomnav"></nav>
  </div>
  <div class="overlay" id="overlay"><div class="ov-card">
    <div class="ring"></div><h4>Actualizando informe</h4>
    <p>Releyendo los Excel fuente y reconstruyendo la fusión, la app y los paneles del Informe Gerencial.</p>
    <div class="ov-steps" id="ovSteps"></div><div class="ov-el" id="ovEl"></div>
  </div></div>
  <div class="toast" id="toast"></div>`;

  const navItem=(n,on,cls)=>`<div class="${cls}${n.v===on?' on':''}" data-v="${n.v}"><span class="ic">${GP.icon?GP.icon(n.ic,cls==='bnav'?22:20):''}</span> <span>${esc(n.label)}</span></div>`;
  function paintNav(){
    $('#navbox').innerHTML=cfg.nav.map(n=>navItem(n,V,'nav')).join('');
    // bottom-nav: máx 5 items (los primeros 5 del nav)
    $('#bottomnav').innerHTML=cfg.nav.slice(0,5).map(n=>navItem(n,V,'bnav')).join('');
    $$('.nav,.bnav').forEach(n=>n.onclick=()=>goto(n.dataset.v));
  }
  function goto(v){ if(!cfg.views[v])return; V=v;
    $$('.nav,.bnav').forEach(x=>x.classList.toggle('on',x.dataset.v===V));
    try{location.hash=V;}catch(e){} save(); render(); const m=$('#main'); if(m)m.scrollTop=0; try{scrollTo(0,0);}catch(e){} }
  GP.goto=goto;
  paintNav();

  // freshchip: click alterna popover (para táctil); hover lo maneja CSS
  function wireFresh(){ const fc=$('#freshChip'); if(!fc)return;
    fc.onclick=e=>{ e.stopPropagation(); fc.classList.toggle('open'); };
    fc.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();fc.classList.toggle('open');} }; }
  wireFresh();
  document.addEventListener('click',e=>{ const fc=$('#freshChip'); if(fc&&!fc.contains(e.target))fc.classList.remove('open'); });
  // pills de filtro (mes/área, multi-selección) por delegación
  document.addEventListener('click',e=>{ const p=e.target.closest('[data-pill]'); if(p){ GP._pill(p.getAttribute('data-pill'),p.getAttribute('data-val')); } });
  // filas expandibles de tablas dinámicas (.exp-h data-g -> muestra/oculta .exp-c mismo data-g)
  document.addEventListener('click',e=>{ const h=e.target.closest('.exp-h'); if(h&&h.dataset.g){ const on=h.classList.toggle('open'); const g=h.dataset.g;
    $$('.exp-c').forEach(r=>{ if(r.dataset.g===g) r.classList.toggle('show',on); }); } });

  function filterBar(){
    const opt=(arr,sel)=>arr.map(o=>`<option ${o===sel?'selected':''}>${esc(o)}</option>`).join('');
    const dd={
      anio:()=>`<div class="fl"><label>Año Emisión</label><select onchange="GP._sf('anio',this.value)">${opt(['Todos',...uniq(GP.DB.map(GP.yearOf)).reverse()],F.anio)}</select></div>`,
      empresa:()=>`<div class="fl"><label>Empresa</label><select onchange="GP._sf('empresa',this.value)">${opt(['Todas',...uniq(GP.DB.map(r=>r.empresa))],F.empresa)}</select></div>`,
      cliente:()=>`<div class="fl"><label>Cliente</label><select onchange="GP._sf('cliente',this.value)">${opt(['Todas',...uniq(GP.DB.map(r=>r.cliente))],F.cliente)}</select></div>`
    };
    const pill=(key,val,lb,on)=>`<button class="pill${on?' on':''}" data-pill="${key}" data-val="${esc(''+val)}">${esc(lb)}</button>`;
    const pd={
      mes:()=>`<div class="pillrow"><span class="pilllbl">Mes</span>${pill('mes','__all__','Todos',F.mes.length===0)}${GP.MESF.map((m,i)=>pill('mes',i+1,m,F.mes.includes(i+1))).join('')}</div>`,
      area:()=>{ const areas=uniq(GP.DB.map(r=>r.area)); return `<div class="pillrow"><span class="pilllbl">Área</span>${pill('area','__all__','Todas',F.area.length===0)}${areas.map(a=>pill('area',a,a,F.area.includes(a))).join('')}</div>`; }
    };
    const ddKeys=flt.filter(k=>dd[k]), pdKeys=flt.filter(k=>pd[k]);
    return `<div class="filters">${ddKeys.map(k=>dd[k]()).join('')}<button class="btn" onclick="GP._clearF()">Limpiar</button></div>`
      + (pdKeys.length?`<div class="pillzone">${pdKeys.map(k=>pd[k]()).join('')}</div>`:'');
  }
  GP._sf=(k,v)=>{ F[k]=v; save(); render(); };
  GP._pill=(key,val)=>{ if(val==='__all__'){ F[key]=[]; } else { const v=(key==='mes')?+val:val; const i=F[key].indexOf(v); if(i>=0)F[key].splice(i,1); else F[key].push(v); } save(); render(); };
  GP._clearF=()=>{ F.empresa='Todas';F.cliente='Todas';F.mes=[];F.area=[]; save(); render(); };

  function passBase(r){ return (F.empresa==='Todas'||r.empresa===F.empresa)&&(F.area.length===0||F.area.includes(r.area))&&(F.cliente==='Todas'||r.cliente===F.cliente); }
  function passMes(r){ if(!F.mes.length)return true; return F.mes.includes(GP.monthOf(r.emision||r.mesServicio)); }
  function pass(r){ return (F.anio==='Todos'||GP.yearOf(r)===F.anio)&&passMes(r)&&passBase(r); }
  GP.rows=()=> cfg.cartera? GP.DB.filter(r=>passMes(r)&&passBase(r)) : GP.DB.filter(pass);
  GP.F=F;

  function updEmp(){ const el=$('#empBadge'); const k=LOGOS[F.empresa]; el.innerHTML=k?`<img src="_Aplicaciones/_assets/logos/${k}.png" onerror="this.style.display='none'" alt="${esc(F.empresa)}">`:''; }
  function render(){
    updEmp();
    const R=GP.rows();
    const ctx={F,filterBar,cfg};
    $('#main').innerHTML=`<div class="view-enter">${filterBar()}${cfg.views[V](R,ctx)}</div>`;
    if(GP.wireTables)GP.wireTables($('#main'));
    if(cfg.after)cfg.after(V,R);
  }
  GP.render=render;

  function applyMeta(){ const M=GP.META; $('#updTime').textContent=M.generadoEl?M.generadoEl.slice(0,16):'—';
    const fw=$('#freshWrap'); if(fw){ fw.innerHTML=GP.freshChip(); wireFresh(); }
    $('#sideFoot').innerHTML=`CIERRE <b>${(M.nCierre||0).toLocaleString('es-CL')}</b> · PROY <b>${M.nProyectado||0}</b><br>Motor automático · cada 30 min<br>Generado ${esc(M.generadoEl)||'—'}`; }
  GP.applyMeta=applyMeta;

  // motor
  $('#btnUpd').onclick=()=>runMotor(cfg);

  // boot
  GP.DB=window.__DB__||[]; GP.META=window.__META__||{};
  const h=(location.hash||'').replace('#',''); if(h&&cfg.views[h]){ V=h; $$('.nav,.bnav').forEach(x=>x.classList.toggle('on',x.dataset.v===V)); }
  applyMeta(); GP.loadFlujo().then(()=>{ if(cfg.needFlujo)render(); }); render(); $('#readTime').textContent=GP.nowStr();
  setInterval(()=>GP.reloadData(ok=>{ if(ok){ applyMeta(); render(); $('#readTime').textContent=GP.nowStr(); } }), 15*60*1000);
};

/* ---------------- motor "Actualizar" ---------------- */
const STEPS=[['Leyendo Informe Ingreso (CIERRE)',0],['Leyendo Estado de Facturación (proyectado)',38],['Escribiendo Excel 01 (GENERADO)',55],['Refrescando paneles del Informe Gerencial',68],['Actualizando Flujo de Caja',85]];
function toast(msg,err){ const t=$('#toast'); t.className='toast on'+(err?' err':' ok');
  const ic=GP.icon?GP.icon(err?'alert':'check',15):''; t.innerHTML=ic+'<span>'+esc(msg)+'</span>';
  setTimeout(()=>t.className='toast'+(err?' err':' ok'),4200); }
function runMotor(cfg){
  const ov=$('#overlay'), btn=$('#btnUpd');
  if(location.protocol==='file:'){ toast('Abre la app desde su ícono del escritorio para poder actualizar.',true); return; }
  btn.classList.add('busy'); btn.disabled=true; ov.classList.add('on');
  $('#ovSteps').innerHTML=STEPS.map((s,i)=>`<div class="ov-step" id="ovs${i}"><span class="b">${i+1}</span>${s[0]}</div>`).join('');
  const t0=Date.now(); let done=false;
  const tick=setInterval(()=>{ const el=(Date.now()-t0)/1000; $('#ovEl').textContent=el.toFixed(0)+' s';
    STEPS.forEach((s,i)=>{ const pctT=el/1.4; const node=$('#ovs'+i); const nextAt=STEPS[i+1]?STEPS[i+1][1]:100;
      if(pctT>=nextAt){ node.className='ov-step done'; } else if(pctT>=s[1]){ node.className='ov-step on'; } }); },400);
  fetch('/api/run?t='+Date.now()).then(r=>r.json()).then(()=>poll()).catch(()=>{ fail('No hay conexión con el motor local.'); });
  function poll(){ fetch('/api/status?t='+Date.now()).then(r=>r.json()).then(st=>{
      if(st.state==='running'){ setTimeout(poll,1500); }
      else if(st.state==='done'){ finish(st.code); }
      else if(st.state==='error'){ fail('El motor devolvió un error.'); }
      else { setTimeout(poll,1500); }
    }).catch(()=>setTimeout(poll,2000)); }
  function finish(code){ if(done)return; done=true; clearInterval(tick);
    STEPS.forEach((s,i)=>$('#ovs'+i).className='ov-step done');
    GP.reloadData(ok=>{ ov.classList.remove('on'); btn.classList.remove('busy'); btn.disabled=false;
      if(ok){ GP.applyMeta(); GP.render(); $('#readTime').textContent=GP.nowStr(); toast('Informe actualizado · '+(GP.META.generadoEl||'').slice(11,16)); }
      else toast('Actualizado, pero no pude recargar la data.',true); }); }
  function fail(msg){ if(done)return; done=true; clearInterval(tick); ov.classList.remove('on'); btn.classList.remove('busy'); btn.disabled=false; toast(msg,true); }
}
})();

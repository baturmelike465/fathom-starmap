/* Fathom Starmap — the vault as a living 3D galaxy, reading Obsidian's own index live. */
import { Plugin, ItemView, Menu } from 'obsidian';
import type { WorkspaceLeaf } from 'obsidian';

import { VIEW_TYPE, FAMS, FAMORDER, RNAME, PENTA, TIERCAP, FOCAL, ZMIN, ZMAX, BACKDROP_COUNT, BACKDROP_RADIUS_MIN, BACKDROP_RADIUS_RANGE } from './config/constants';
import { DEF } from './config/defaults';
import { SLIDERS } from './config/sliders';
import { CSS } from './config/styles';
import { rotHue } from './utils/color';
import { hash } from './utils/hash';
import { hull } from './logic/hull';
import { physicsStep } from './logic/forces';
import { project, lensPoint } from './logic/projection';
import { ensureFam as ensureFamFn } from './logic/palette';
import { createSoundEngine } from './audio/soundscape';
import type { StarNode, StarLink, BlackHole, DyingNode, Projectable, BackdropStar, Particle, CameraState } from './types';
import { exportWallpaper } from './wallpaper/export';

class StarmapView extends ItemView {
  plugin: FathomStarmapPlugin;
  root: any;
  S: any;
  dead: boolean = false;
  rafId: number = 0;
  ro: ResizeObserver | null = null;
  AC: AudioContext | null = null;
  // dynamic properties set by startEngine
  [key: string]: any;

  constructor(leaf: WorkspaceLeaf, plugin: FathomStarmapPlugin){ super(leaf); this.plugin = plugin; }
  getViewType(){ return VIEW_TYPE; }
  getDisplayText(){ return 'Fathom Starmap'; }
  getIcon(){ return 'star'; }

  buildData(){
    const app = this.app;
    const exList = (this.S && this.S.exclude || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
    const files = app.vault.getMarkdownFiles().filter(f =>{
      if(/^(_to_delete|copilot|Archive)\//.test(f.path)) return false;
      if(f.path.split('/').some(s=>s.startsWith('.'))) return false;
      if(exList.length){
        const top = f.path.split('/')[0].toLowerCase();
        if(exList.some(ex => top === ex)) return false;
      }
      return true;
    });
    const byPath = {}, nodes = [];
    // 'log' notes (journals, session logs, dailies) render as smaller ember
    // stars; everything else is a full star. Detected by top-level folder name.
    const group = p =>
      /log|journal|daily|session/i.test(p.split('/')[0]) && p.indexOf('/')>=0 ? 'log' : 'note';
    for(const f of files){
      const name = f.basename;
      const m = name.match(/^(\d{4}-\d{2}-\d{2})/);
      const d = m ? m[1] : new Date(f.stat.ctime).toISOString().slice(0,10);
      byPath[f.path] = name;
      // dated:true only when the date came from the TITLE — filesystem timestamps
      // update on any edit, which made 77 stars strobe supernovas after a bulk edit
      nodes.push({id:name, p:f.path, g:group(f.path), d, dated:!!m, b:f.stat.size, w:0});
    }
    const idxByName = {}; nodes.forEach((n,i)=>idxByName[n.id]=i);
    const linkSet = new Set(), resolved = app.metadataCache.resolvedLinks;
    for(const src in resolved){
      if(!(src in byPath)) continue;
      for(const tgt in resolved[src]){
        if(!(tgt in byPath)) continue;
        const s = byPath[src], t = byPath[tgt];
        if(s !== t) linkSet.add(s+''+t);
      }
    }
    const links = [...linkSet].map((k: string)=>{const i=k.indexOf('');return {s:k.slice(0,i), t:k.slice(i+1)};});
    for(const l of links) nodes[idxByName[l.t]].w++;
    // the black hole's diet: notes resting in Archive / _to_delete
    const swallowed = app.vault.getMarkdownFiles().filter(f=>/^(_to_delete|Archive)\//.test(f.path)).length;
    return {nodes, links, swallowed};
  }

  async onOpen(){
    const root = this.contentEl.createDiv({cls:'fsm-root'});
    this.root = root;
    // always refresh the stylesheet — a stale cached copy from an older plugin
    // version left the settings sliders unstyled (floating white pills)
    let st = document.getElementById('fsm-style');
    if(!st){ st = document.createElement('style'); st.id='fsm-style'; document.head.appendChild(st); }
    st.textContent = CSS;
    root.innerHTML = `
      <canvas></canvas>
      <div class="fsm-cart"><h1>Fathom <em>Starmap</em></h1><p class="fsm-stats"></p></div>
      <div class="fsm-search fsm-hidezen"><input type="text" placeholder="search the brain…" spellcheck="false"><div class="fsm-results"></div></div>
      <button class="fsm-util fsm-hidezen fsm-snd" style="top:58px" title="ambient sound">&#9834;</button>
      <button class="fsm-util fsm-zenb" style="top:92px" title="zen — hide UI (Esc exits)">&#9681;</button>
      <button class="fsm-util fsm-hidezen fsm-shotb" style="top:126px" title="capture a still">&#10047;</button>
      <button class="fsm-util fsm-hidezen fsm-boomb" style="top:160px" title="supernova">&#10038;</button>
      <button class="fsm-util fsm-hidezen fsm-refb" style="top:194px" title="re-read the vault">&#8635;</button>
      <div class="fsm-legend"></div>
      <div class="fsm-timeline"><button class="fsm-play">&#9654;</button><button class="fsm-tourb">&#10022;</button><input class="fsm-scrub" type="range" min="0" max="1" value="1"><span class="fsm-date"></span></div>
      <div class="fsm-caption"></div>
      <div class="fsm-tip"><span class="fsm-kind"></span><span class="fsm-name"></span></div>
      <div class="fsm-shot"><img alt=""><p>right-click the image to save it</p><button>close</button></div>
      <button class="fsm-util fsm-hidezen fsm-gearb" style="top:228px" title="galaxy settings">&#9881;</button>
      <div class="fsm-panel fsm-hidezen"></div>`;
    this.S = Object.assign({}, DEF, (await this.plugin.loadData()) || {});
    // personal constellation seeds live in the user's own data.json, never in code
    if(this.S.famSeeds) for(const k in this.S.famSeeds) if(FAMS[k]) FAMS[k].seeds=this.S.famSeeds[k];
    this.startEngine();
  }

  onClose(){
    this.dead = true;
    if(this.rafId) cancelAnimationFrame(this.rafId);
    if(this.ro) this.ro.disconnect();
    if(this.AC){ try{this.AC.close();}catch(_){} }
    return Promise.resolve();
  }

  startEngine(){
    const view = this, app = this.app, root = this.root;
    const S = this.S;
    const $ = sel => root.querySelector(sel);
    const canvas = $('canvas'), ctx = canvas.getContext('2d');
    const tip=$('.fsm-tip'), tipKind=$('.fsm-kind'), tipName=$('.fsm-name');
    const captionEl=$('.fsm-caption');
    let W=0,H=0,DPR=1;
    const fogCv=document.createElement('canvas'), fogCtx=fogCv.getContext('2d');
    const resize=()=>{DPR=Math.min(window.devicePixelRatio||1,2);
      W=root.clientWidth||600; H=root.clientHeight||400;
      canvas.width=W*DPR; canvas.height=H*DPR;
      fogCv.width=Math.max(2,Math.round(W*0.7)); fogCv.height=Math.max(2,Math.round(H*0.7));};
    this.ro = new ResizeObserver(resize); this.ro.observe(root); resize();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- data (live from the vault) ----
    let nodes: any[]=[], links: any[]=[], idx: Record<string,number>={}, dates: string[]=[], anchors: any[]=[];
    // the black hole: a world-space object off the galaxy's rim (Archive + _to_delete).
    // Purely decorative — it exerts NO force on live stars, so the layout
    // signed off on: cannot be disturbed by it.
    const hole: any={x:0,y:0,z:0,tx:0,ty:0,tz:0,n:0,init:false,scr:0,sx:0,sy:0,ss:1,sd:0,near:false,nf:1};
    const dying=[];   // stars mid-spiral into the hole (notes that left the vault)
    const FC = f => FAMS[f];
    const FNAME = f => FAMS[f].dispName||FAMS[f].name;   // folder name on generic vaults
    // hash imported from utils/hash

    const loadData=()=>{
      const D = view.buildData();
      // SEAMLESS refresh: existing stars keep their exact position and motion.
      // Rebuilding from seed on every vault change made the whole galaxy
      // scramble-and-resettle after each edit — the untouchable "flicker".
      const prevMap={};
      for(const o of nodes) prevMap[o.id]=o;
      const hadPrev=nodes.length>0;
      idx={};
      nodes = D.nodes.map((n,i)=>{
        idx[n.id]=i;
        // seed radius grows with vault size so 5000 notes don't boot inside a
        // pinhole and spend a minute exploding — unchanged for vaults ≤150
        const k=i+0.5, phi=Math.acos(1-2*k/D.nodes.length), th=Math.PI*(1+Math.sqrt(5))*k,
          r=120*Math.max(1,Math.cbrt(D.nodes.length/150));
        const mass=Math.cbrt(n.b||600);
        const nn: any={id:n.id,g:n.g,w:n.w,p:n.p,d:n.d,dated:n.dated,b:n.b,
          x:r*Math.sin(phi)*Math.cos(th), y:r*Math.sin(phi)*Math.sin(th), z:r*Math.cos(phi),
          vx:0,vy:0,vz:0,
          r:n.g==='log' ? Math.min(4.2,2.1+mass*0.055) : Math.max(3.4,2.4+Math.sqrt(n.w)*1.6+mass*0.13),
          nbr:new Set(), tw:(i*0.618)%1, fam:null, sx:0,sy:0,ss:1,sd:0, vis:1, near:false, isNew:false};
        const o=prevMap[n.id];
        if(o){
          nn.x=o.x; nn.y=o.y; nn.z=o.z; nn.vx=o.vx; nn.vy=o.vy; nn.vz=o.vz;
          nn.sdS=o.sdS; nn.dim=o.dim; nn.litE=o.litE; nn.lblA=o.lblA; nn.lblOn=o.lblOn;
          nn.lc=o.lc; nn.tw=o.tw; nn.nf=o.nf;
        } else nn.isNew=hadPrev;
        return nn;
      });
      links = D.links.map(l=>{const s=idx[l.s],t=idx[l.t];
        nodes[s].nbr.add(t); nodes[t].nbr.add(s); return {s,t};});
      nodes.forEach(n=>n.deg=n.nbr.size||1);
      { const q=[];
        let seedHits=0;   // only NON-core seeds count — names like README exist everywhere
        for(const k of FAMORDER) for(const s of FAMS[k].seeds){
          const i=idx[s]; if(i!==undefined){if(k!=='core')seedHits++; if(!nodes[i].fam){nodes[i].fam=k; q.push(i);}}}
        while(q.length){const i=q.shift();
          for(const j of nodes[i].nbr) if(!nodes[j].fam){nodes[j].fam=nodes[i].fam; q.push(j);}}
        nodes.forEach(n=>{if(!n.fam)n.fam='core';});
        // GENERIC VAULTS: when the built-in seed names barely match (someone
        // else's vault), constellations come from top-level folders instead —
        // biggest folders get the colors, loose root notes stay 'core'.
        view.genFam = seedHits<3;
        for(const k of FAMORDER) FAMS[k].dispName=FAMS[k].name;
        if(view.genFam){
          const folders={};
          for(const n of nodes){
            if(!n.p||n.p.indexOf('/')<0)continue;
            const f=n.p.split('/')[0]; folders[f]=(folders[f]||0)+1;
          }
          // EVERY top-level folder gets its own constellation — no cap.
          // The biggest folders ride the seven hand-tuned colors; each one
          // after that mints its own family (see ensureFam), with a color
          // spaced round the wheel. Loose root notes stay 'core'.
          const top=Object.keys(folders).sort((a,b)=>folders[b]-folders[a]);
          const slots=FAMORDER.filter(k=>k!=='core');
          const fmap={};
          top.forEach((f,i)=>{
            const k=i<slots.length?slots[i]:view.ensureFam('dyn'+(i-slots.length));
            fmap[f]=k; FAMS[k].dispName=f;
          });
          FAMS.core.dispName=top.length?'root notes':'notes';
          for(const n of nodes){
            const f=(n.p&&n.p.indexOf('/')>=0)?n.p.split('/')[0]:null;
            n.fam=(f&&fmap[f])?fmap[f]:'core';
          }
        }
        // legend follows whichever naming is live
        view.famCounts={}; for(const n of nodes) view.famCounts[n.fam]=(view.famCounts[n.fam]||0)+1;
        if(view.rebuildLegend) view.rebuildLegend();
      }
      const maxD=nodes.reduce((m,n)=>n.d>m?n.d:m,'');
      const dayN=s=>{const p=s.split('-');return (+p[0])*372+(+p[1])*31+(+p[2]);};
      nodes.forEach(n=>{n.nova = n.dated && dayN(maxD)-dayN(n.d) <= 9;});
      // brand-new notes are born INSIDE their constellation, next to a neighbor —
      // not scattered from seed
      for(const nn of nodes){
        if(!nn.isNew||!nn.nbr.size)continue;
        const nb=nodes[[...nn.nbr][0]];
        if(nb&&!nb.isNew){
          nn.x=nb.x+(Math.random()-0.5)*26;
          nn.y=nb.y+(Math.random()-0.5)*26;
          nn.z=nb.z+(Math.random()-0.5)*26;
        }
      }
      // notes that vanished from the live sky spiral into the black hole.
      // (A RENAMED note also fires this — old name dies, new name is born
      // beside a neighbor. Rare, harmless, and honestly a bit poetic.)
      if(hadPrev){
        for(const oid in prevMap){
          if(idx[oid]===undefined){
            const o=prevMap[oid];
            if(dying.length>80)dying.shift();   // a mass purge can't build an endless queue
            dying.push({x:o.x,y:o.y,z:o.z,fam:o.fam||'core',r:o.r||3,t:0,ph:Math.random()*6.283});
            showCaption('&ldquo;'+esc(oid)+'&rdquo;','swallowed by the black hole',3600);
          }
        }
      }
      hole.n = D.swallowed||0;
      anchors = nodes.filter(n=>n.w>=5 || (FAMS[n.fam].seeds.includes(n.id)&&n.w>=1));
      dates=[...new Set(nodes.map(n=>n.d))].sort();
      scrub.max=String(dates.length-1); scrub.value=String(dates.length-1);
      timePos=dates.length-1;
      const vn=(app.vault&&app.vault.getName)?app.vault.getName():'your vault';
      $('.fsm-stats').textContent = `${String(vn).toLowerCase()} · ${nodes.length} notes · ${links.length} links · live`;
      // a background refresh barely warms the physics; only first load runs hot.
      // Huge vaults boot half-cooled — their seed layout already starts wide,
      // so they need far fewer (expensive) settling steps.
      alpha = hadPrev ? Math.max(alpha,0.3) : (D.nodes.length>2500?0.6:1);
      if(hadPrev) focusIdx=-1;
      applyTime();
    };

    // ---- UI refs ----
    const scrub=$('.fsm-scrub'), dateLbl=$('.fsm-date'), playBtn=$('.fsm-play'), tourBtn=$('.fsm-tourb');
    const qInput=$('.fsm-search input'), resBox=$('.fsm-results');
    let timePos=0, playing=false, playAcc=0;
    let capTimer=null;
    const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
    const showCaption=(main,sub,ms)=>{
      captionEl.innerHTML=main+(sub?'<span class="fsm-sub">'+sub+'</span>':'');
      captionEl.classList.add('fsm-show');
      clearTimeout(capTimer);
      if(ms) capTimer=setTimeout(()=>captionEl.classList.remove('fsm-show'),ms);
    };
    const hideCaption=()=>{clearTimeout(capTimer);captionEl.classList.remove('fsm-show');};
    const applyTime=()=>{
      const cur=dates[timePos];
      dateLbl.textContent=cur+(timePos===dates.length-1?' · now':'');
      let vis=0;
      for(const n of nodes){n.vis = n.d<=cur ? 1 : 0; vis+=n.vis;}
      if(timePos<dates.length-1) dateLbl.textContent=cur+' · '+vis;
      if(playing){
        const born=nodes.filter(n=>n.d===cur&&n.g==='log');
        if(born.length){
          const title=born[0].id.replace(/^\d{4}-\d{2}-\d{2}\s*/,'');
          showCaption('&ldquo;'+esc(title)+'&rdquo;', cur, 3200);
        }
      }
    };
    scrub.addEventListener('input',()=>{timePos=+scrub.value;playing=false;playBtn.innerHTML='&#9654;';hideCaption();applyTime();});
    playBtn.addEventListener('click',()=>{
      if(playing){playing=false;playBtn.innerHTML='&#9654;';return;}
      playing=true; playBtn.innerHTML='&#10074;&#10074;';
      if(timePos>=dates.length-1){timePos=0;scrub.value='0';applyTime();}
    });

    // legend + solo — rebuilt after every vault read so generic vaults show
    // their own folder names, and empty constellations don't clutter the list
    let famSolo=null;
    const legend=$('.fsm-legend');
    view.rebuildLegend=()=>{
      legend.innerHTML=''; famSolo=null;
      const lFams=['core'].concat((view.famOrder||FAMORDER).filter(x=>x!=='core'));
      for(const k of lFams){
        if(view.famCounts&&!view.famCounts[k])continue;
        const f=FAMS[k];
        const row=document.createElement('div');
        row.className='fsm-row'; row.dataset.fam=k;
        row.innerHTML='<span class="fsm-dot" style="background:'+f.color+';box-shadow:0 0 8px '+f.color+'"></span>'+FNAME(k).toLowerCase();
        row.addEventListener('click',()=>{
          famSolo = famSolo===k ? null : k;
          legend.querySelectorAll('.fsm-row').forEach(r=>r.classList.toggle('fsm-off', famSolo!==null&&r.dataset.fam!==famSolo));
        });
        legend.appendChild(row);
      }
    };
    view.rebuildLegend();

    // ---- sound (delegated to audio/soundscape) ----
    const sndBtn=$('.fsm-snd');
    const sound=createSoundEngine(()=>view.dead);
    sndBtn.addEventListener('click',async()=>{
      const nowOn=await sound.toggle(S.vol);
      view.AC=sound.ctx;   // update after potential creation
      if(nowOn===false && !sound.ctx){ sndBtn.style.display='none'; return; }
      if(nowOn===false && sound.ctx && sound.ctx.state!=='running'){ sndBtn.textContent='✕'; return; }
      sndBtn.classList.toggle('fsm-on',nowOn);
    });
    view.applyVol=()=>sound.applyVol(S.vol);
    const blip=fam=>sound.blip(fam);

    // ---- nebula sprites ----
    const makePuff=color=>{
      const s=512, cv=document.createElement('canvas'); cv.width=cv.height=s;
      const c=cv.getContext('2d');
      for(let i=0;i<9;i++){
        const ang=i*0.72, dist=s*(0.03+i*0.012);
        const ox=s/2+Math.cos(ang)*dist, oy=s/2+Math.sin(ang)*dist;
        const r0=s*(0.38+i*0.015);
        const g=c.createRadialGradient(ox,oy,0,ox,oy,r0);
        const peak=0.14-i*0.012;
        g.addColorStop(0,'rgba(255,255,255,'+Math.max(0.02,peak)+')');
        g.addColorStop(0.3,'rgba(255,255,255,'+Math.max(0.01,peak*0.6)+')');
        g.addColorStop(0.7,'rgba(255,255,255,'+Math.max(0.005,peak*0.15)+')');
        g.addColorStop(1,'rgba(255,255,255,0)');
        c.fillStyle=g; c.fillRect(0,0,s,s);
      }
      c.globalCompositeOperation='source-in';
      c.fillStyle=color; c.fillRect(0,0,s,s);
      return cv;
    };
    const puffs={}; for(const k in FAMS) puffs[k]=makePuff(FAMS[k].color);
    // pre-rendered glow sprites: stamping an image beats building a gradient per star per frame
    const makeGlowSprite=color=>{
      const s=256, cv=document.createElement('canvas'); cv.width=cv.height=s;
      const c=cv.getContext('2d');
      const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
      g.addColorStop(0,'rgba(255,255,255,1)');
      g.addColorStop(0.15,'rgba(255,255,255,0.7)');
      g.addColorStop(0.35,'rgba(255,255,255,0.3)');
      g.addColorStop(0.6,'rgba(255,255,255,0.08)');
      g.addColorStop(1,'rgba(255,255,255,0)');
      c.fillStyle=g; c.fillRect(0,0,s,s);
      c.globalCompositeOperation='source-in';
      c.fillStyle=color; c.fillRect(0,0,s,s);
      return cv;
    };
    const glows={}; for(const k in FAMS) glows[k]=makeGlowSprite(FAMS[k].color);
    // base palette + universe hue rotation
    const BASEPAL={}; for(const k in FAMS) BASEPAL[k]=FAMS[k].color;
    const applyHue=()=>{
      for(const k in FAMS){
        const r=rotHue(BASEPAL[k],S.hue);
        const c=S.hue?r.css:BASEPAL[k];
        FAMS[k].color=c;            // rotated everywhere; BASEPAL keeps the original
        FAMS[k].rgb=r.rgb;
        puffs[k]=makePuff(c);
        glows[k]=makeGlowSprite(c);
        const dot=legend.querySelector('.fsm-row[data-fam="'+k+'"] .fsm-dot');
        if(dot){dot.style.background=c; dot.style.boxShadow='0 0 8px '+c;}
      }
    };
    view.applyHue=applyHue;
    if(S.hue) applyHue();          // restore a saved hue on open
    // ---- dynamic constellations — palette functions imported from logic/palette
    view.famOrder=FAMORDER.slice();
    FAMORDER.forEach((k,i)=>{FAMS[k].snd=PENTA[i];});
    const dynCols=[];                 // cached by mint order — colors never shift
    view.ensureFam=k=>ensureFamFn(k, view.famOrder, BASEPAL, dynCols, puffs, glows, makePuff, makeGlowSprite, S, view.famF);
    // backdrop stars are REAL 3D points on a distant sphere — they move through the
    // same camera as everything else (the old flat parallax layer slid wrongly)
    const stars=[];
    for(let i=0;i<BACKDROP_COUNT;i++){
      const u=hash(i,7)*2-1, th2=hash(i,13)*6.283;
      const rr=BACKDROP_RADIUS_MIN+hash(i,29)*BACKDROP_RADIUS_RANGE, sq=Math.sqrt(Math.max(0,1-u*u));
      stars.push({x:Math.cos(th2)*sq*rr, y:u*rr*0.85, z:Math.sin(th2)*sq*rr, b:0.25+hash(i,3)*0.6, l:i%3});
    }
    let shoot=null, shootTimer=1600;
    const particles=[];
    const rebuildParticles=()=>{
      particles.length=0;
      const N=reduceMotion?0:Math.round(S.comets);
      for(let i=0;i<N;i++) particles.push({l:i*97,t:(i*0.137)%1,sp:0.0012+((i*53)%100)/100*0.002});
    };
    rebuildParticles();
    view.rebuildParticles=rebuildParticles;
    // expose live data for wallpaper export
    view.getGraphData=()=>({nodes,links,S});

    // ---- physics (constants live in S so the settings panel can tune them) ----
    let alpha=1;
    const step=()=>{
      physicsStep(nodes, links, S, alpha, view);
      // big vaults cool faster — each step costs more, so fewer are spent settling
      if(alpha>0.1)alpha*=(nodes.length>2500?0.991:nodes.length>1200?0.996:0.999);
    };

    // ---- camera + flight ----
    let yaw=0.4,pitch=0.18,targetYaw=0.4,targetPitch=0.18,zoom=1,targetZoom=1;
    // zoom range: deep enough out to shrink a 5000-note galaxy to a marble
    // ZMIN, ZMAX imported from config/constants
    let ctr={x:0,y:0,z:0}, focusIdx=-1;
    const autoSpin=!reduceMotion;
    // FOCAL, F2 imported from config/constants
    let flightMode=false;
    const cam={x:0,y:0,z:0}, vel={x:0,y:0,z:0};
    const axes=()=>{
      const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
      return {fwd:[-cp*sy, sp, cp*cy], rgt:[cy,0,sy], up:[-sp*sy,-cp,sp*cy]};
    };
    const enterFlight=()=>{
      if(flightMode)return;
      flightMode=true; focusIdx=-1;
      const {fwd}=axes(); const D=FOCAL/(0.9*zoom);
      cam.x=ctr.x-fwd[0]*D; cam.y=ctr.y-fwd[1]*D; cam.z=ctr.z-fwd[2]*D;
      vel.x=vel.y=vel.z=0; targetYaw=yaw; targetPitch=pitch;
      try{ const r=canvas.requestPointerLock(); if(r&&r.catch)r.catch(()=>{}); }catch(_){}
      showCaption('flight mode','mouse aims · wasd thrust · shift boost · esc to land',2800);
    };
    const exitFlight=()=>{
      if(!flightMode)return;
      flightMode=false;
      const {fwd}=axes(); const D=FOCAL/(0.9*zoom);
      ctr.x=cam.x+fwd[0]*D; ctr.y=cam.y+fwd[1]*D; ctr.z=cam.z+fwd[2]*D;
      vel.x=vel.y=vel.z=0;
      try{ if(document.pointerLockElement===canvas) document.exitPointerLock(); }catch(_){}
    };
    this.registerDomEvent(document,'pointerlockchange',()=>{
      if(flightMode && document.pointerLockElement!==canvas) exitFlight();
    });
    const projectNode=(n)=>{
      const camState: CameraState={yaw,pitch,zoom,flightMode,ctr,cam,vel,targetYaw,targetPitch,targetZoom,focusIdx};
      project(n, camState, W, H);
    };
    // gravitational lensing — delegates to logic/projection
    const lensP=(p)=>lensPoint(p, hole);

    // ---- search ----
    let selRes=0, curMatches=[];
    const flyTo=i=>{ exitFlight(); focusIdx=i; targetZoom=2.2; qInput.blur(); resBox.style.display='none'; qInput.value=nodes[i].id; };
    const renderResults=()=>{
      resBox.innerHTML='';
      curMatches.forEach((i,k)=>{
        const div=document.createElement('div');
        div.textContent=nodes[i].id;
        div.style.borderLeftColor=FC(nodes[i].fam).color;
        if(k===selRes) div.classList.add('fsm-sel');
        div.addEventListener('pointerdown',e=>{e.preventDefault();flyTo(i);});
        resBox.appendChild(div);
      });
      resBox.style.display=curMatches.length?'block':'none';
    };
    qInput.addEventListener('input',()=>{
      const q=qInput.value.trim().toLowerCase();
      focusIdx=-1; selRes=0;
      if(!q){curMatches=[];resBox.style.display='none';return;}
      curMatches=nodes.map((n,i)=>i).filter(i=>nodes[i].id.toLowerCase().includes(q)).slice(0,8);
      renderResults();
    });
    qInput.addEventListener('keydown',e=>{
      if(e.key==='ArrowDown'){selRes=Math.min(selRes+1,curMatches.length-1);renderResults();e.preventDefault();}
      else if(e.key==='ArrowUp'){selRes=Math.max(selRes-1,0);renderResults();e.preventDefault();}
      else if(e.key==='Enter'&&curMatches.length){flyTo(curMatches[selRes]);}
      else if(e.key==='Escape'){qInput.value='';curMatches=[];resBox.style.display='none';focusIdx=-1;targetZoom=1;}
      e.stopPropagation();
    });

    // ---- tour ----
    let tour=null;
    const famStats=k=>{
      const m=nodes.filter(n=>n.fam===k);
      let lk=0; for(const l of links) if(nodes[l.s].fam===k&&nodes[l.t].fam===k) lk++;
      return {count:m.length, links:lk, hub:m.reduce((a,b)=>b.w>a.w?b:a,m[0])};
    };
    const tourStop=()=>{tour=null;tourBtn.innerHTML='&#10022;';focusIdx=-1;targetZoom=1;hideCaption();};
    const tourGo=step=>{
      const TO=['core'].concat((view.famOrder||FAMORDER).filter(x=>x!=='core'));
      if(step>=TO.length){tourStop();showCaption('Fathom <em>Starmap</em>','end of tour',3600);return;}
      tour={step,hold:0};
      const k=TO[step], s=famStats(k);
      if(!s.hub){tourGo(step+1);return;}
      focusIdx=nodes.indexOf(s.hub); targetZoom=1.8;
      showCaption(FNAME(k), s.count+' notes · '+s.links+' internal links', 0);
    };
    tourBtn.addEventListener('click',()=>{
      if(tour){tourStop();return;}
      exitFlight(); playing=false; playBtn.innerHTML='&#9654;';
      tourBtn.innerHTML='&#9632;'; tourGo(0);
    });

    // ---- buttons ----
    $('.fsm-zenb').addEventListener('click',()=>root.classList.toggle('fsm-zen'));
    const shot=$('.fsm-shot');
    $('.fsm-shotb').addEventListener('click',()=>{view.wantShot=true;});
    shot.querySelector('button').addEventListener('click',()=>shot.classList.remove('fsm-show'));
    $('.fsm-refb').addEventListener('click',()=>{loadData();showCaption('re-sounded','vault re-read live',2000);});
    $('.fsm-boomb').addEventListener('click',()=>{
      alpha=1;
      for(const n of nodes){
        const d=Math.sqrt(n.x*n.x+n.y*n.y+n.z*n.z)||1;
        const k=26+Math.random()*20;
        n.vx+=n.x/d*k+(Math.random()-0.5)*10;
        n.vy+=n.y/d*k+(Math.random()-0.5)*10;
        n.vz+=n.z/d*k+(Math.random()-0.5)*10;
      }
      sound.supernova();
    });

    // ---- settings panel: sliders bound to S, persisted, like graph controls ----
    {
      const panel=$('.fsm-panel');
      const gear=$('.fsm-gearb');
      gear.addEventListener('click',()=>{panel.classList.toggle('fsm-show');gear.classList.toggle('fsm-on');});
      let saveT=null;
      const save=()=>{clearTimeout(saveT);saveT=setTimeout(()=>view.plugin.saveData(Object.assign({},S)),500);};
      const inputs={};
      const fmt=(k,v)=> k==='center'?v.toFixed(5): k==='spring'?v.toFixed(3): (v>=10?Math.round(v):(+v).toFixed(2));
      let lastSec='';
      for(const sl of SLIDERS){
        if(sl.sec!==lastSec){lastSec=sl.sec;
          const h=document.createElement('h4'); h.textContent=sl.sec; panel.appendChild(h);}
        const row=document.createElement('div'); row.className='fsm-prow';
        row.innerHTML='<div class="fsm-plbl"><span>'+sl.label+'</span><span class="fsm-pval"></span></div>';
        const inp=document.createElement('input');
        inp.type='range'; inp.min=String(sl.min); inp.max=String(sl.max); inp.step=String(sl.step);
        inp.value=String(S[sl.key]);
        const val=row.querySelector('.fsm-pval');
        val.textContent=fmt(sl.key,S[sl.key]);
        inp.addEventListener('input',()=>{
          S[sl.key]=parseFloat(inp.value);
          val.textContent=fmt(sl.key,S[sl.key]);
          if(sl.sec==='forces') alpha=Math.max(alpha,0.55);   // let the galaxy resettle
          if(sl.key==='hue'&&view.applyHue) view.applyHue();
          if(sl.key==='comets'&&view.rebuildParticles) view.rebuildParticles();
          if(sl.key==='vol'&&view.applyVol) view.applyVol();
          save();
        });
        row.appendChild(inp); panel.appendChild(row); inputs[sl.key]={inp,val};
      }
      // ---- galaxy shape presets: buttons, not sliders ----
      const shHead=document.createElement('h4'); shHead.textContent='galaxy shape'; panel.appendChild(shHead);
      const shRow=document.createElement('div');
      shRow.style.display='flex'; shRow.style.flexWrap='wrap'; shRow.style.gap='6px';
      const SHAPES=['natural','spiral','disc','ring','shell','helix','torus','clusters','cube'];
      const shBtns={};
      const paintShapes=()=>{ for(const k in shBtns){ const on=(S.shape||'natural')===k;
        shBtns[k].style.borderColor=on?'rgba(46,230,200,.7)':'rgba(120,140,185,.35)';
        shBtns[k].style.color=on?'#2EE6C8':'#93A3C2'; } };
      for(const nm of SHAPES){
        const b=document.createElement('button');
        b.className='fsm-preset'; b.textContent=nm; b.style.marginTop='4px';
        b.addEventListener('click',()=>{
          S.shape=nm; alpha=1;                       // re-heat so the new shape forms
          view.clR=0;                                // clusters re-measure their spacing
          for(const nn of nodes) nn.hxA=undefined;   // helix strands re-freeze
          if(nm!=='natural'&&targetPitch<0.35) targetPitch=0.55;  // tilt to see the plane
          paintShapes(); save();
        });
        shRow.appendChild(b); shBtns[nm]=b;
      }
      panel.appendChild(shRow); paintShapes();
      // ---- exclude folders ----
      const exHead=document.createElement('h4'); exHead.textContent='exclude folders'; panel.appendChild(exHead);
      const exRow=document.createElement('div'); exRow.className='fsm-prow';
      exRow.innerHTML='<div class="fsm-plbl"><span>folder names (comma-separated)</span></div>';
      const exInp=document.createElement('input');
      exInp.type='text'; exInp.value=S.exclude||'';
      exInp.placeholder='e.g. templates, daily, archive';
      exInp.style.cssText='width:100%;background:rgba(20,25,40,.6);border:1px solid rgba(120,140,185,.3);color:#c8d0e0;padding:5px 8px;border-radius:4px;font-size:12px;margin-top:4px;';
      exInp.addEventListener('change',()=>{
        S.exclude=exInp.value; save(); loadData();
      });
      exRow.appendChild(exInp); panel.appendChild(exRow);
      const reset=document.createElement('button');
      reset.className='fsm-preset'; reset.textContent='restore defaults';
      reset.addEventListener('click',()=>{
        Object.assign(S,DEF);
        for(const sl of SLIDERS){inputs[sl.key].inp.value=String(S[sl.key]);inputs[sl.key].val.textContent=fmt(sl.key,S[sl.key]);}
        exInp.value=S.exclude||'';
        alpha=1;
        paintShapes();
        if(view.applyHue)view.applyHue();
        if(view.rebuildParticles)view.rebuildParticles();
        if(view.applyVol)view.applyVol();
        loadData();
        save();
      });
      panel.appendChild(reset);
    }

    // hull() imported from logic/hull

    // ---- interaction ----
    let hover=-1,dragging=false,px=0,py=0,idleT=0,downX=0,downY=0,lastBlip=-1;
    let mouseOver=false;
    root.addEventListener('mouseenter',()=>mouseOver=true);
    root.addEventListener('mouseleave',()=>mouseOver=false);
    const rel=e=>{const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
    const hiddenN = n => !n.vis || n.near || (famSolo&&n.fam!==famSolo);
    const pick=(mx,my)=>{let best=-1,bd=1e9;
      for(let i=0;i<nodes.length;i++){const n=nodes[i];
        if(hiddenN(n))continue;
        const dx=n.sx-mx,dy=n.sy-my,d=dx*dx+dy*dy;
        const rr=Math.max(n.r*n.ss+6,11);
        if(d<rr*rr&&d<bd){bd=d;best=i;}}
      return best;};
    const ptrs=new Map();
    let pinchStart=0,pinchZoom0=1;
    canvas.addEventListener('pointermove',e=>{
      const m=rel(e);
      if(ptrs.has(e.pointerId)) ptrs.set(e.pointerId,{x:m.x,y:m.y});
      if(ptrs.size===2){
        const [a,b]=[...ptrs.values()];
        const d=Math.hypot(a.x-b.x,a.y-b.y)||1;
        targetZoom=Math.min(ZMAX,Math.max(ZMIN,pinchZoom0*(d/pinchStart)));
        idleT=0;return;
      }
      if(dragging){
        targetYaw-=(m.x-px)*0.005;
        targetPitch=Math.max(-1.2,Math.min(1.2,targetPitch+(m.y-py)*0.004));
        px=m.x;py=m.y;idleT=0;return;}
      if(flightMode){
        const mx=e.movementX||0,my=e.movementY||0;
        targetYaw-=mx*0.0024;
        targetPitch=Math.max(-1.35,Math.min(1.35,targetPitch+my*0.0019));
        hover=-1; tip.style.display='none'; idleT=0;
        return;
      }
      hover=pick(m.x,m.y);
      if(hover>=0){const n=nodes[hover];
        if(hover!==lastBlip){blip(n.fam);lastBlip=hover;}
        tip.style.display='block';
        tip.style.left=Math.min(m.x+14,W-330)+'px';
        tip.style.top=Math.min(m.y+12,H-64)+'px';
        tipKind.textContent=FNAME(n.fam)+' · '+n.d+(n.w?' · '+n.w+' inbound':'');
        tipKind.style.color=FAMS[n.fam].color;
        tipName.textContent=n.id;
        canvas.style.cursor='pointer';
      } else if(hole.scr>0&&Math.hypot(m.x-hole.sx,m.y-hole.sy)<hole.scr*1.2){
        tip.style.display='block';
        tip.style.left=Math.min(m.x+14,W-330)+'px';
        tip.style.top=Math.min(m.y+12,H-64)+'px';
        tipKind.textContent='the black hole';
        tipKind.style.color='#F0B34E';
        tipName.textContent=(hole.n||0)+' notes swallowed · Archive + _to_delete';
        canvas.style.cursor='default';
      } else {tip.style.display='none';canvas.style.cursor='grab';lastBlip=-1;}
    });
    canvas.addEventListener('pointerdown',e=>{
      if(e.button===2){dragging=false;return;}   // right-click never starts a drag — it opens the star menu
      if(tour) tourStop();
      canvas.setPointerCapture(e.pointerId);
      const m=rel(e);
      ptrs.set(e.pointerId,{x:m.x,y:m.y});
      if(ptrs.size===2){
        const [a,b]=[...ptrs.values()];
        pinchStart=Math.hypot(a.x-b.x,a.y-b.y)||1;
        pinchZoom0=targetZoom; dragging=false; return;
      }
      dragging=true;px=m.x;py=m.y;downX=m.x;downY=m.y;
      canvas.classList.add('fsm-drag');tip.style.display='none';});
    canvas.addEventListener('pointerup',e=>{
      ptrs.delete(e.pointerId);
      if(ptrs.size>0){dragging=false;return;}
      dragging=false;canvas.classList.remove('fsm-drag');
      const m=rel(e);
      const dx=m.x-downX, dy=m.y-downY;
      if(dx*dx+dy*dy<25 && !flightMode){
        const hit=pick(m.x,m.y);
        if(hit>=0&&nodes[hit].p){
          app.workspace.openLinkText(nodes[hit].p,'',true);   // open the note in a new tab, natively
        } else if(hit<0&&focusIdx>=0){ focusIdx=-1; targetZoom=1; }
      }
    });
    canvas.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);dragging=false;canvas.classList.remove('fsm-drag');});
    canvas.addEventListener('wheel',e=>{e.preventDefault();
      targetZoom=Math.min(ZMAX,Math.max(ZMIN,targetZoom*(e.deltaY<0?1.1:0.9)));},{passive:false});
    canvas.addEventListener('pointerleave',()=>{hover=-1;tip.style.display='none';});
    canvas.addEventListener('dblclick',()=>{exitFlight();focusIdx=-1;targetZoom=1;targetYaw=0.4;targetPitch=0.18;});
    // right-click a star → the same native menu the graph view gives (open, rename, delete, plugins…)
    canvas.addEventListener('contextmenu',e=>{
      e.preventDefault();
      const m=rel(e);
      const hit=pick(m.x,m.y);
      if(hit<0||!nodes[hit].p) return;
      const file=app.vault.getAbstractFileByPath(nodes[hit].p);
      if(!file) return;
      tip.style.display='none';
      const menu=new Menu();
      menu.addItem(it=>it.setTitle('Open').setIcon('file').onClick(()=>app.workspace.openLinkText(nodes[hit].p,'',false)));
      menu.addItem(it=>it.setTitle('Open in new tab').setIcon('file-plus').onClick(()=>app.workspace.openLinkText(nodes[hit].p,'',true)));
      menu.addSeparator();
      app.workspace.trigger('file-menu',menu,file,'fathom-starmap');
      menu.showAtPosition({x:e.clientX,y:e.clientY});
    });

    // flight keys — only when the mouse is over the starmap (or already flying)
    const keys=new Set();
    this.registerDomEvent(document,'keydown',e=>{
      if(e.key==='Escape'){root.classList.remove('fsm-zen');exitFlight();return;}
      if(!(mouseOver||flightMode)) return;
      if(document.activeElement===qInput) return;
      const k=e.key.toLowerCase();
      if('wasdqe'.includes(k)&&k.length===1){keys.add(k);enterFlight();e.preventDefault();}
      if(e.key==='Shift')keys.add('shift');
    });
    this.registerDomEvent(document,'keyup',e=>{
      keys.delete(e.key.toLowerCase());
      if(e.key==='Shift')keys.delete('shift');
    });

    loadData();
    // live refresh when the vault's link index changes (debounced)
    let refT=null;
    this.registerEvent(app.metadataCache.on('resolved',()=>{
      clearTimeout(refT); refT=setTimeout(()=>{ if(!view.dead&&!dragging&&!flightMode) loadData(); },20000);
    }));

    // ---- render ----
    const order=()=>nodes.map((_,i)=>i).sort((a,b)=>(nodes[b].r-nodes[a].r)||(a-b));
    let ord=order();
    const famF={}; view.famF=famF; for(const k in FAMS) famF[k]=0;   // eased per-family fade for hover; ensureFam adds new keys
    let t0=performance.now();
    // PERF: idle-frame throttling — when nothing is actively changing, skip
    // every other frame (30fps). The galaxy still twinkles and spins but uses
    // roughly half the CPU/GPU. Any interaction instantly restores 60fps.
    let skipNext=false, idleFrames=0;
    const frame=now=>{
      if(view.dead) return;
      const t=(now-t0)/1000;
      // decide whether the galaxy is "idle" — settled physics, no interaction
      const isIdle = alpha<0.005 && !dragging && !flightMode && hover<0
        && !playing && !tour && S.warp===0 && S.heat<0.01
        && focusIdx<0 && dying.length===0;
      if(isIdle) idleFrames++; else idleFrames=0;
      // after 60 idle frames (~1s) start skipping every other frame → ~30fps
      // with prefers-reduced-motion: render only every 3rd frame → ~20fps
      if(idleFrames>60){
        const skip = reduceMotion ? (idleFrames%3!==0) : (idleFrames%2!==0);
        if(skip){ view.rafId=requestAnimationFrame(frame); return; }
      }
      if(nodes.length){
        // settle-then-freeze: the galaxy always forms itself (alpha hot), then
        // the time-warp slider governs — 0 (the default) freezes physics dead,
        // which is what makes 5000-note vaults run like a dream
        let effWarp=S.warp;
        // shapes form at double speed — "the spiral takes too long"
        if(alpha>0.12) effWarp=Math.max((S.shape||'natural')!=='natural'?2:1,effWarp);
        else if(reduceMotion) effWarp=0;
        else if(S.heat>0.01) effWarp=Math.max(1,effWarp);   // boiling needs steps
        view.stepAcc=(view.stepAcc||0)+effWarp;
        while(view.stepAcc>=1){ step(); view.stepAcc--; }
        view.alphaNow=alpha; view.warpNow=effWarp;   // debug readout, harmless
        idleT++;
        if(autoSpin&&!dragging&&!flightMode&&idleT>140) targetYaw+=0.00035*S.spin;
        yaw+=(targetYaw-yaw)*0.08; pitch+=(targetPitch-pitch)*0.08; zoom+=(targetZoom-zoom)*0.08;
        if(flightMode){
          idleT=0;
          const {fwd,rgt,up}=axes();
          const acc=(keys.has('shift')?0.45:0.15)*S.thrust;
          const th=(v,k)=>{vel.x+=v[0]*k*acc;vel.y+=v[1]*k*acc;vel.z+=v[2]*k*acc;};
          if(keys.has('w'))th(fwd,1); if(keys.has('s'))th(fwd,-1);
          if(keys.has('d'))th(rgt,1); if(keys.has('a'))th(rgt,-1);
          if(keys.has('e'))th(up,1);  if(keys.has('q'))th(up,-1);
          vel.x*=0.965;vel.y*=0.965;vel.z*=0.965;
          cam.x+=vel.x;cam.y+=vel.y;cam.z+=vel.z;
        } else {
          // aim at the LIVE centre of the visible stars, not the world origin —
          // a drifted layout can leave the origin in empty space (the galaxy
          // then sits off in a screen corner with no way to recenter). This
          // keeps the galaxy centered always: through drift, time replay, and
          // constellation solo (the camera glides to the soloed constellation).
          const tgt = focusIdx>=0 ? nodes[focusIdx] : (view.gCtr||{x:0,y:0,z:0});
          // 12% per frame gives a smooth but noticeably quicker recenter than 6%
          const ease = 0.12;
          ctr.x+=(tgt.x-ctr.x)*ease; ctr.y+=(tgt.y-ctr.y)*ease; ctr.z+=(tgt.z-ctr.z)*ease;
        }
        if(tour){ tour.hold++; if(tour.hold>(reduceMotion?90:420)) tourGo(tour.step+1); }
        if(playing){
          playAcc++;
          if(playAcc>=(reduceMotion?1:14)){
            playAcc=0; timePos++;
            if(timePos>=dates.length-1){timePos=dates.length-1;playing=false;playBtn.innerHTML='&#9654;';}
            scrub.value=String(timePos); applyTime();
          }
        }
        for(const n of nodes){ projectNode(n); lensP(n); }
        // FIXED draw order — big stars behind, small in front, decided once and
        // NEVER re-sorted by camera depth. Camera-dependent order swaps between
        // overlapping discs were the color flips (confirmed frame-by-frame on video).
        if(ord.length!==nodes.length) ord=order();
      }

      ctx.setTransform(DPR,0,0,DPR,0,0);
      const bg=ctx.createRadialGradient(W/2,H*0.42,0,W/2,H*0.42,Math.max(W,H)*0.8);
      bg.addColorStop(0,'#080D1A'); bg.addColorStop(1,'#03050A');
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      if(S.stars>0.02){
        const sp={x:0,y:0,z:0,sx:0,sy:0,ss:1,sd:0,near:false,nf:1};
        for(const s of stars){
          sp.x=s.x; sp.y=s.y; sp.z=s.z;
          projectNode(sp);
          if(sp.near)continue;
          if(sp.sx<-4||sp.sx>W+4||sp.sy<-4||sp.sy>H+4)continue;
          const twk=reduceMotion?1:0.6+0.4*Math.sin(t*1.1+s.x*0.02);
          ctx.fillStyle='rgba(190,205,235,'+Math.min(0.9,0.12*s.b*twk*(s.l+1)*S.stars)+')';
          ctx.fillRect(sp.sx,sp.sy,s.l>1?1.6:1,s.l>1?1.6:1);
        }
      }
      const hn=hover>=0?nodes[hover]:null;
      // eased hover state: everything fades over ~250ms instead of snapping
      for(let i=0;i<nodes.length;i++){const n=nodes[i];
        const dt=hn&&i!==hover&&!hn.nbr.has(i)?1:0;
        n.dim=(n.dim||0)+(dt-(n.dim||0))*0.09;
        const lt=(i===hover||i===focusIdx)?1:0;
        n.litE=(n.litE||0)+(lt-(n.litE||0))*0.15;
      }
      for(const l of links){
        const on=hn&&(l.s===hover||l.t===hover)?1:0;
        l.hl=(l.hl||0)+(on-(l.hl||0))*0.12;
        l.dm=(l.dm||0)+((hn&&!on?1:0)-(l.dm||0))*0.09;
      }
      for(const k in famF) famF[k]+=((hn&&hn.fam!==k?1:0)-famF[k])*0.09;

      // nebula — drawn at HALF resolution on an offscreen canvas, then upscaled.
      // Fog is soft anyway; this quarters the fill cost that caused the zoom lag.
      if(S.nebula>0.02){
        fogCtx.setTransform(1,0,0,1,0,0);
        fogCtx.clearRect(0,0,fogCv.width,fogCv.height);
        fogCtx.setTransform(0.7,0,0,0.7,0,0);   // full-res coords, scaled to fog canvas
        fogCtx.globalCompositeOperation='lighter';
        for(let ai=0;ai<anchors.length;ai++){
          const n=anchors[ai];
          if(hiddenN(n))continue;
          const sprite=puffs[n.fam];
          const fd=famF[n.fam];
          const baseR=Math.min(420,(62+n.w*5.5)*n.ss);
          const ext=baseR*2.4;  // full possible spread of this anchor's fog
          if(n.sx<-ext||n.sx>W+ext||n.sy<-ext||n.sy>H+ext)continue;
          const puffN=n.ss>1.8?8:(n.w>=10?16:12);   // more puffs for smoother fog
          for(let p=0;p<puffN;p++){
            const h1=hash(ai,p),h2=hash(ai,p+50),h3=hash(ai,p+100);
            const ang=h1*6.283+(reduceMotion?0:t*0.03*(h2-0.5));
            const dist=baseR*(0.15+h2*0.75), R=baseR*(0.55+h3*0.9);
            const a=(0.09-0.04*fd)*S.nebula*(0.6+0.4*Math.sin(t*0.2+h1*6.283))*(n.nf===undefined?1:n.nf);
            if(a<0.009)continue;   // PERF: skip invisible puffs
            fogCtx.globalAlpha=Math.max(0.008,a);
            fogCtx.drawImage(sprite,n.sx+Math.cos(ang)*dist-R,n.sy+Math.sin(ang)*dist-R,R*2,R*2);
          }
          if(fd<0.9&&S.dust>0.02){
            fogCtx.fillStyle='rgba('+FC(n.fam).rgb+',0.5)';
            for(let d=0;d<18;d++){
              const h1=hash(ai+300,d),h2=hash(ai+400,d);
              const ang=h1*6.283, dist=baseR*(0.2+h2*0.9);
              const twk=reduceMotion?0.5:0.25+0.45*Math.sin(t*1.6+h1*40);
              fogCtx.globalAlpha=Math.min(0.9,0.35*twk*(1-fd)*S.dust);
              fogCtx.fillRect(n.sx+Math.cos(ang)*dist,n.sy+Math.sin(ang)*dist,2.6,2.6);
            }
          }
        }
        fogCtx.globalAlpha=1;
        ctx.globalCompositeOperation='screen';
        ctx.drawImage(fogCv,0,0,W,H);
        ctx.globalCompositeOperation='source-over';
      }

      // cartography
      const ringOps=[];   // near-side orbiting letters, drawn after the stars
      {
        const famPts={}, famNds={};
        for(const n of nodes){
          if(hiddenN(n))continue;
          (famPts[n.fam]=famPts[n.fam]||[]).push([n.sx,n.sy,n.w]);
          (famNds[n.fam]=famNds[n.fam]||[]).push(n);
        }
        // whole-galaxy bounds: names sit on the OUTSKIRTS, at their sector's direction
        let gcx=0,gcy=0,gcz=0,gn=0;
        for(const n of nodes){ if(hiddenN(n))continue; gcx+=n.x;gcy+=n.y;gcz+=n.z;gn++; }
        if(gn){gcx/=gn;gcy/=gn;gcz/=gn; view.gCtr={x:gcx,y:gcy,z:gcz};}   // live galaxy centre — the camera's true home
        const gdist=[]; for(const n of nodes){ if(hiddenN(n))continue; gdist.push(Math.hypot(n.x-gcx,n.y-gcy,n.z-gcz)); }
        gdist.sort((a,b)=>a-b);
        const Rg=gdist[Math.floor(gdist.length*0.85)]||100;
        const gP: any={x:gcx,y:gcy,z:gcz,sx:0,sy:0,ss:1,sd:0,near:false,nf:1}; projectNode(gP);
        // black hole rides a fixed bearing off the rim, following the galaxy
        // as it breathes — eased, so growth/settling never makes it jump
        hole.tx=gcx+Math.cos(2.1)*Rg*1.8; hole.ty=gcy+Rg*0.34; hole.tz=gcz+Math.sin(2.1)*Rg*1.8;
        hole.rg=Rg;
        if(!hole.init){hole.x=hole.tx;hole.y=hole.ty;hole.z=hole.tz;hole.init=true;}
        for(const k in famPts){
          const pts=famPts[k];
          if(pts.length<4)continue;
          const fd2=famF[k];
          const h=hull(pts.map(p=>[p[0],p[1]]));
          if(h&&h.length>=3){
            let cx=0,cy2=0; for(const p of h){cx+=p[0];cy2+=p[1];} cx/=h.length;cy2/=h.length;
            ctx.setLineDash([2,6]);
            ctx.strokeStyle='rgba('+FC(k).rgb+','+(0.13-0.08*fd2)+')';
            ctx.lineWidth=0.8;
            ctx.beginPath();
            h.forEach((p,i)=>{
              const ix=p[0]+(p[0]-cx)*0.14, iy=p[1]+(p[1]-cy2)*0.14;
              i?ctx.lineTo(ix,iy):ctx.moveTo(ix,iy);
            });
            ctx.closePath();ctx.stroke();
            ctx.setLineDash([]);
            // PERF: skip the expensive per-letter 3D orbit names when the slider is off
            if(S.names<0.02) continue;
            // --- 3D ORBIT NAME: each sector's title lives on its own tilted ring
            // around the whole galaxy, like planets on different orbital planes.
            // Fixed in world space at its sector's bearing; it wheels with rotation,
            // and far-side letters shrink, fade and mirror like text on glass. ---
            const mem=famNds[k]||[];
            if(mem.length>=4){
              let c3x=0,c3y=0,c3z=0,twt=0;
              for(const n of mem){const wgt=1+n.w;c3x+=n.x*wgt;c3y+=n.y*wgt;c3z+=n.z*wgt;twt+=wgt;}
              c3x/=twt;c3y/=twt;c3z/=twt;
              const FOA=view.famOrder||FAMORDER;
              const idxF=Math.max(0,FOA.indexOf(k));
              const inc=((idxF%7)-3)*0.20;      // this ring's tilt out of the galaxy plane
              const nodA=idxF*2.399;            // where its tilt axis points (golden angle)
              const ux=Math.cos(nodA), uz=Math.sin(nodA);
              const vx=-Math.sin(nodA)*Math.cos(inc), vy=Math.sin(inc), vz=Math.cos(nodA)*Math.cos(inc);
              // each ring a little wider than the last; with many constellations
              // the spacing tightens so the outermost ring stays close to home
              const R3=Rg*1.24+20+idxF*Math.min(9,63/Math.max(7,FOA.length-1));
              const scRef=gP.ss;
              const fs=Math.max(9,Math.min(30,Rg*scRef*0.115))*S.nameSize;
              if(fs>9.5){
                const rname=view.genFam?FNAME(k).toUpperCase():(RNAME[k]||FAMS[k].name.toUpperCase());
                if(!view.famLC)view.famLC={};
                if(!view.famLC[rname]){
                  ctx.font='italic 100px Georgia, serif';
                  const adv=[]; let tot=0;
                  for(const chr of rname){const w2=ctx.measureText(chr).width;adv.push(w2);tot+=w2;}
                  view.famLC[rname]={adv,tot};
                }
                const lc=view.famLC[rname], sc2=fs/100;
                // fixed anchor: the point on this ring nearest the sector's stars
                let angW=0,bD=Infinity;
                for(let s2=0;s2<64;s2++){
                  const a2=s2/64*6.28319;
                  const px2=gcx+(ux*Math.cos(a2)+vx*Math.sin(a2))*R3;
                  const py2=gcy+(vy*Math.sin(a2))*R3;
                  const pz2=gcz+(uz*Math.cos(a2)+vz*Math.sin(a2))*R3;
                  const d2=(px2-c3x)*(px2-c3x)+(py2-c3y)*(py2-c3y)+(pz2-c3z)*(pz2-c3z);
                  if(d2<bD){bD=d2;angW=a2;}
                }
                ctx.textAlign='center';
                const spacing=fs*0.14;
                const totalAng=(lc.tot*sc2+spacing*(rname.length-1))/(R3*scRef);
                // --- NAME-LEVEL crowding test (computed ONCE for the whole name) ---
                // Project the name's start, middle and end points, then compare
                // each half's on-screen length with the room the letters actually
                // need. An edge-on ring — or an arc squeezed by perspective — gives
                // the letters less room than they need, so the WHOLE name fades as
                // one unit. No partial text, no letters piling on top of each other.
                const rp=aa=>{const o={x:gcx+(ux*Math.cos(aa)+vx*Math.sin(aa))*R3,y:gcy+(vy*Math.sin(aa))*R3,z:gcz+(uz*Math.cos(aa)+vz*Math.sin(aa))*R3,sx:0,sy:0,ss:1,sd:0,near:false,nf:1};projectNode(o);return o;};
                const cwS=rp(angW-totalAng/2), cwM=rp(angW), cwE=rp(angW+totalAng/2);
                const relM=Math.max(0.35,Math.min(1.6,cwM.ss/Math.max(0.001,scRef)));
                const halfW=Math.max(1,(lc.tot*sc2+spacing*(rname.length-1))*0.5*relM);
                const c1=Math.hypot(cwM.sx-cwS.sx,cwM.sy-cwS.sy)/halfW;
                const c2=Math.hypot(cwE.sx-cwM.sx,cwE.sy-cwM.sy)/halfW;
                const crowd=Math.min(c1,c2);
                // crowd ≈1 = letters get full room, →0 = letters pile up
                const crowdFade=Math.min(1,Math.max(0,(crowd-0.40)/0.25));
                // FAR-SIDE FADE: how deep the name's midpoint sits behind the
                // galaxy centre, as a fraction of the ring radius. -1 = nearest
                // point in front, 0 = silhouette edge, +1 = farthest behind.
                // The name melts away as it swings round the back of the ball.
                const depthFrac=(cwM.sd-gP.sd)/R3;
                const depthFade=Math.min(1,Math.max(0,(0.10-depthFrac)/0.55));
                // LATCHED flip: a name keeps its reading orientation while visible.
                // wantFlip says which way the text SHOULD face right now (with a
                // few px of hysteresis so it can't dither when near vertical); the
                // stored flip only adopts it once the name has fully melted out —
                // so the 180° twist happens off-stage, never in front of the eyes.
                if(!view.famFade)view.famFade={};
                if(!view.famFlip)view.famFlip={};
                const eDx=cwE.sx-cwS.sx;
                if(view.famFlip[k]===undefined)view.famFlip[k]=eDx<0;
                const wantFlip=Math.abs(eDx)<4?view.famFlip[k]:(eDx<0);
                const fPrev0=view.famFade[k];
                if(view.famFlip[k]!==wantFlip&&(fPrev0===undefined||fPrev0<0.03))view.famFlip[k]=wantFlip;
                const flip=view.famFlip[k];
                // TILT FADE: how far the text leans from horizontal on screen.
                // A name melts away as it keels past ~40°, gone by 65° — so you
                // never watch the letters rotate toward vertical.
                const eDy=cwE.sy-cwS.sy;
                let tilt=Math.abs(Math.atan2(eDy,eDx))*57.2958; if(tilt>90)tilt=180-tilt;
                const tiltFade=Math.min(1,Math.max(0,(65-tilt)/25));
                // STICKY SWITCH: one clean vanish, one clean return per transit.
                // A name that has faded out must stay out for 90 frames and can
                // only relight on a strong case (>0.55) — the faint mid-transit
                // blips that caused vanish-reappear-vanish can never re-light it.
                // While lit, brightness may dim but not below a floor, so brief
                // squeezes read as a graceful dip instead of a blink.
                if(!view.famOn)view.famOn={};
                if(!view.famOffAge)view.famOffAge={};
                let vTgt=crowdFade*depthFade*tiltFade;
                let onSt=view.famOn[k]===true;
                let offAge=(view.famOffAge[k]===undefined?999:view.famOffAge[k])+1;
                if(!onSt&&vTgt>0.55&&offAge>90)onSt=true;
                else if(onSt&&vTgt<0.08){onSt=false;offAge=0;}
                view.famOn[k]=onSt; view.famOffAge[k]=offAge;
                if(onSt)vTgt=Math.max(vTgt,0.25); else vTgt=0;
                // EASED alpha: the shown fade can only glide toward its target
                // (8% of the gap per frame), so names can never pop in or out.
                // A name facing the wrong way targets zero: melt out, swap, return.
                const fTgt=(flip===wantFlip)?vTgt:0;
                const fPrev=fPrev0===undefined?fTgt:fPrev0;
                const fEase=view.famFade[k]=fPrev+(fTgt-fPrev)*0.08;
                const gnf=gP.nf===undefined?1:gP.nf;  // smooth fade when diving inside
                const baseA=(0.34-0.24*fd2)*fEase*gnf;
                if(baseA>0.01){
                const tmp={x:0,y:0,z:0,sx:0,sy:0,ss:1,sd:0,near:false,nf:1};
                let a=angW-totalAng/2;
                for(let ci=0;ci<rname.length;ci++){
                  const li=flip?rname.length-1-ci:ci; // draw letters back-to-front when flipped
                  const da=(lc.adv[li]*sc2/2)/(R3*scRef);
                  a+=da;
                  tmp.x=gcx+(ux*Math.cos(a)+vx*Math.sin(a))*R3;
                  tmp.y=gcy+(vy*Math.sin(a))*R3;
                  tmp.z=gcz+(uz*Math.cos(a)+vz*Math.sin(a))*R3;
                  tmp.near=false;
                  projectNode(tmp);
                  if(!tmp.near){
                    const a3=a+0.02;
                    const tt={x:gcx+(ux*Math.cos(a3)+vx*Math.sin(a3))*R3,y:gcy+(vy*Math.sin(a3))*R3,z:gcz+(uz*Math.cos(a3)+vz*Math.sin(a3))*R3,sx:0,sy:0,ss:1,sd:0,near:false,nf:1};
                    projectNode(tt);
                    const dx2=tt.sx-tmp.sx, dy2=tt.sy-tmp.sy;
                    const rot=Math.atan2(dy2,dx2);
                    const rel=Math.max(0.35,Math.min(1.6,tmp.ss/Math.max(0.001,scRef)));
                    const aL=baseA*(tmp.nf===undefined?1:tmp.nf);
                    if(aL>0.02){
                      ctx.save();
                      ctx.translate(tmp.sx,tmp.sy);
                      ctx.rotate(flip?rot+Math.PI:rot);
                      ctx.font='italic '+(fs*rel).toFixed(1)+'px Georgia, serif';
                      ctx.fillStyle='rgba('+FC(k).rgb+','+aL.toFixed(3)+')';
                      ctx.fillText(rname[li],0,0);
                      ctx.restore();
                    }
                  }
                  a+=da+spacing/(R3*scRef);
                }}
              }
            }
          }
        }
      }

      // shooting star
      if(!reduceMotion){
        if(shoot){
          shoot.t+=0.03;
          if(shoot.t>1)shoot=null;
          else{
            const sx=shoot.x+shoot.dx*shoot.t, sy=shoot.y+shoot.dy*shoot.t;
            const g=ctx.createLinearGradient(sx,sy,sx-shoot.dx*0.12,sy-shoot.dy*0.12);
            g.addColorStop(0,'rgba(220,240,255,0.9)');g.addColorStop(1,'rgba(220,240,255,0)');
            ctx.strokeStyle=g;ctx.lineWidth=1.4;
            ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx-shoot.dx*0.12,sy-shoot.dy*0.12);ctx.stroke();}
        } else if(S.meteors>0.01&&--shootTimer<=0){
          shootTimer=Math.max(20,(1600+((now|0)%1400))/S.meteors);
          const fromLeft=((now|0)%2)===0;
          shoot={x:fromLeft?-50:W+50,y:H*0.12+((now|0)%Math.max(1,H*0.45|0)),dx:(fromLeft?1:-1)*(W*0.5),dy:H*0.22,t:0};
        }
      }

      // ---- the black hole: Archive + _to_delete as a dark object at the rim ----
      // Drawn BEFORE links and stars (they pass in front); its own glow is
      // additive, so like every other halo it is order-independent and cannot
      // flicker. It exerts no force — decoration only.
      hole.scr=0; hole.lens=0;
      if(S.hole>0.02&&nodes.length&&hole.init){
        hole.x+=(hole.tx-hole.x)*0.04; hole.y+=(hole.ty-hole.y)*0.04; hole.z+=(hole.tz-hole.z)*0.04;
        projectNode(hole);
        // far-side fade — same trick as the sector names: when its orbit carries
        // it behind the galaxy, the whole object (black disc included) melts out
        // instead of punching a hard black dot through the bright core.
        const rg=hole.rg||100;
        const far=Math.min(1,Math.max(0,(hole.sd-rg*0.5)/rg));
        const hnf=(hole.nf===undefined?1:hole.nf)*(1-far);
        if(!hole.near&&hnf>0.02){
          const depth=Math.max(0.25,Math.min(1.15,1-hole.sd/500));
          // the horizon grows with every meal — gently, on a square root
          const R0=Math.min(96,(17+Math.min(30,Math.sqrt(hole.n||0)*3.4))*S.hole*hole.ss);
          if(hole.sx>-R0*4&&hole.sx<W+R0*4&&hole.sy>-R0*4&&hole.sy<H+R0*4){
            hole.scr=R0;
            hole.lens=R0*1.35*hnf;              // Einstein radius, fading with the hole
            // ---- PIXEL LENSING: re-draw the already-painted sky around the
            // hole pulled toward the horizon, ring by ring. Everything behind
            // it — fog, glow, starfield — visibly bends. Inside the Einstein
            // ring the sky reappears inverted: the secondary image. ----
            if(hole.lens>8){
              const thE=hole.lens;
              const LR=Math.ceil(Math.min(1000,Math.max(W,H),R0*7)/16)*16;
              if(!view.warpCv){
                view.warpCv=document.createElement('canvas');view.warpCtx=view.warpCv.getContext('2d');
                view.warp2=document.createElement('canvas');view.warp2Ctx=view.warp2.getContext('2d');
              }
              const wcv=view.warpCv, wc=view.warpCtx, w2=view.warp2, w2c=view.warp2Ctx;
              const side=Math.min(2048,Math.ceil(LR*2*DPR/64)*64);
              if(wcv.width!==side){wcv.width=side;wcv.height=side;}
              if(w2.width!==LR*2){w2.width=LR*2;w2.height=LR*2;}
              const cx0=hole.sx-LR, cy0=hole.sy-LR;
              const qx0=Math.max(0,cx0), qy0=Math.max(0,cy0);
              const qx1=Math.min(W,hole.sx+LR), qy1=Math.min(H,hole.sy+LR);
              if(qx1>qx0&&qy1>qy0){
                wc.clearRect(0,0,side,side);
                wc.drawImage(canvas, qx0*DPR,qy0*DPR,(qx1-qx0)*DPR,(qy1-qy0)*DPR,
                             (qx0-cx0)*DPR,(qy0-cy0)*DPR,(qx1-qx0)*DPR,(qy1-qy0)*DPR);
                // build the warped sky in an offscreen buffer: 96 fine slices,
                // then composite back through a 1px blur that fuses the steps
                // (and reads as gravitational heat-haze)
                // PERF: fewer warp rings when the hole is small on screen
                const NR=R0>40?96:R0>20?64:32, inR=thE*1.02, sw=LR*2*DPR;
                const rg=x=>inR+(LR-inR)*Math.pow(x,1.7);   // densest at the ring
                w2c.clearRect(0,0,LR*2,LR*2);
                for(let ri=0;ri<NR;ri++){
                  const r0=rg(ri/NR);
                  const r1=rg((ri+1)/NR)+0.7;               // overlap hides seams
                  const m=(r0+r1)/2;
                  let defl=thE*thE/m;
                  defl*=Math.max(0,1-Math.pow((m-inR)/(LR-inR),2));  // taper: no seam at the rim
                  const inv=Math.min(2.2, m/Math.max(1,m-defl));     // cap: no exploding slices or radial smears
                  w2c.save();
                  w2c.beginPath();w2c.arc(LR,LR,r1,0,7);w2c.arc(LR,LR,r0,0,7,true);w2c.clip();
                  w2c.translate(LR,LR);w2c.scale(inv,inv);
                  w2c.drawImage(wcv,0,0,sw,sw,-LR,-LR,LR*2,LR*2);
                  w2c.restore();
                }
                // secondary image: the sky inside the ring, inverted + squeezed
                w2c.save();
                w2c.beginPath();w2c.arc(LR,LR,inR+0.6,0,7);w2c.clip();
                w2c.translate(LR,LR);w2c.rotate(3.14159);w2c.scale(0.45,0.45);
                w2c.globalAlpha=0.85;
                w2c.drawImage(wcv,0,0,sw,sw,-LR,-LR,LR*2,LR*2);
                w2c.restore();
                // composite the warped sky back, softly
                ctx.save();
                ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
                ctx.beginPath();ctx.arc(hole.sx,hole.sy,LR-2,0,7);ctx.clip();
                try{ctx.filter='blur(1px)';}catch(_){}
                ctx.drawImage(w2,0,0,LR*2,LR*2, hole.sx-LR,hole.sy-LR,LR*2,LR*2);
                try{ctx.filter='none';}catch(_){}
                ctx.restore();
              }
            }
            // Gargantua, not Saturn: near-edge-on hot disk crossing the sphere,
            // the far side's light LENSED over the top as a full ring, doppler
            // beaming (approaching side burns brighter), soft-edged horizon.
            const AC =S.hue?rotHue('#F0B34E',S.hue).rgb:'240,179,78';   // disk body gold
            const HOT=S.hue?rotHue('#FFE9C4',S.hue).rgb:'255,233,196';  // inner-edge white heat
            const ph=reduceMotion?0:t*0.35;
            const TILT=0.42;                    // disk lean on screen
            const A=hnf*depth;
            ctx.save();
            ctx.translate(hole.sx,hole.sy);
            ctx.globalCompositeOperation='screen';
            // faint ambient glow, tight — mood, not a floodlight
            const g=ctx.createRadialGradient(0,0,R0*0.8,0,0,R0*2.6);
            g.addColorStop(0,'rgba('+AC+',0)');
            g.addColorStop(0.25,'rgba('+AC+','+(0.16*A).toFixed(3)+')');
            g.addColorStop(1,'rgba('+AC+',0)');
            ctx.fillStyle=g; ctx.fillRect(-R0*2.7,-R0*2.7,R0*5.4,R0*5.4);
            // LENSED RING — the far side of the disk bent around the sphere:
            // razor-thin, hugging the horizon, brighter over the crown.
            // Butt-capped exact segments: overlap + additive blending was
            // stamping bright tick marks at every joint (seen in test shots).
            ctx.rotate(TILT);
            // PERF: fewer arc segments when the hole is small
            const SEG=R0>30?60:R0>15?36:20, TAU=6.28319;
            for(let si=0;si<SEG;si++){
              const a0=(si/SEG)*TAU, a1=((si+1)/SEG)*TAU;
              const am=(a0+a1)/2;
              const dopp=Math.max(0.10,0.4+0.6*Math.cos(am));        // left = approaching = burns
              const topBias=0.7+0.3*Math.max(0,-Math.sin(am));       // crown brighter than chin
              const shim=1+0.10*Math.sin(am*3-ph*4);
              const rr=R0*1.10;
              ctx.strokeStyle='rgba('+HOT+','+Math.min(1,1.1*A*dopp*topBias*shim).toFixed(3)+')';
              ctx.lineWidth=Math.max(1.1,R0*0.045);
              ctx.beginPath(); ctx.arc(0,0,rr,a0,a1); ctx.stroke();
              ctx.strokeStyle='rgba('+AC+','+(0.20*A*dopp*topBias).toFixed(3)+')';
              ctx.lineWidth=Math.max(1.8,R0*0.08);
              ctx.beginPath(); ctx.arc(0,0,rr*1.035,a0,a1); ctx.stroke();
            }
            // secondary image: the disk lensed AGAIN under the chin — a faint,
            // tighter mirror arc (the reference render's under-ring)
            ctx.strokeStyle='rgba('+HOT+','+(0.32*A).toFixed(3)+')';
            ctx.lineWidth=Math.max(0.8,R0*0.028);
            ctx.beginPath();ctx.arc(0,0,R0*1.22,0.55,2.6);ctx.stroke();
            ctx.strokeStyle='rgba('+AC+','+(0.12*A).toFixed(3)+')';
            ctx.lineWidth=Math.max(1.4,R0*0.05);
            ctx.beginPath();ctx.arc(0,0,R0*1.26,0.55,2.6);ctx.stroke();
            // the accretion disk as a CLOSED smooth ellipse — no clipped wing
            // tips, no protruding spikes. Drawn in two halves: back half first
            // (the horizon then hides what passes behind the sphere), front
            // half after the horizon so it crosses in front.
            const diskHalf=(a0,a1,mul)=>{
              ctx.save(); ctx.scale(1,0.13);
              ctx.beginPath();
              ctx.arc(0,0,R0*3.3,a0,a1);
              ctx.arc(0,0,R0*1.05,a1,a0,true);
              ctx.closePath(); ctx.clip();
              ctx.globalAlpha=mul;
              const bb=ctx.createRadialGradient(0,0,R0*1.05,0,0,R0*3.3);
              bb.addColorStop(0.00,'rgba('+HOT+','+Math.min(1,0.95*A).toFixed(3)+')');
              bb.addColorStop(0.09,'rgba('+HOT+','+(0.55*A).toFixed(3)+')');
              bb.addColorStop(0.13,'rgba('+AC+','+(0.18*A).toFixed(3)+')');
              bb.addColorStop(0.18,'rgba('+AC+','+(0.60*A).toFixed(3)+')');
              bb.addColorStop(0.30,'rgba('+AC+','+(0.48*A).toFixed(3)+')');
              bb.addColorStop(0.34,'rgba('+AC+','+(0.14*A).toFixed(3)+')');
              bb.addColorStop(0.40,'rgba('+AC+','+(0.46*A).toFixed(3)+')');
              bb.addColorStop(0.55,'rgba('+AC+','+(0.28*A).toFixed(3)+')');
              bb.addColorStop(0.60,'rgba('+AC+','+(0.09*A).toFixed(3)+')');
              bb.addColorStop(0.66,'rgba('+AC+','+(0.24*A).toFixed(3)+')');
              bb.addColorStop(0.82,'rgba('+AC+','+(0.10*A).toFixed(3)+')');
              bb.addColorStop(1,'rgba('+AC+',0)');
              ctx.fillStyle=bb; ctx.fillRect(-R0*3.4,-R0*3.4,R0*6.8,R0*6.8);
              if(mul>=1){
                // doppler burn on the approaching wing — kept INSIDE the ring
                const db=ctx.createRadialGradient(R0*1.6,R0*0.3,0,R0*1.6,R0*0.3,R0*1.4);
                db.addColorStop(0,'rgba('+HOT+','+Math.min(1,0.85*A).toFixed(3)+')');
                db.addColorStop(0.45,'rgba('+HOT+','+(0.28*A).toFixed(3)+')');
                db.addColorStop(1,'rgba('+HOT+',0)');
                ctx.fillStyle=db; ctx.fillRect(-R0*3.4,-R0*3.4,R0*6.8,R0*6.8);
              }
              ctx.globalAlpha=1;
              ctx.restore();
            };
            diskHalf(3.14159,6.28318,0.5);   // back half — dimmer, occluded next
            ctx.globalCompositeOperation='source-over';
            // EVENT HORIZON — soft-edged void, not a flat coin
            const hg=ctx.createRadialGradient(0,0,0,0,0,R0);
            hg.addColorStop(0,'rgba(0,0,0,'+hnf.toFixed(3)+')');
            hg.addColorStop(0.86,'rgba(0,0,0,'+hnf.toFixed(3)+')');
            hg.addColorStop(1,'rgba(0,0,0,0)');
            ctx.fillStyle=hg;
            ctx.beginPath();ctx.arc(0,0,R0,0,7);ctx.fill();
            ctx.globalCompositeOperation='screen';
            // photon ring: razor-thin white-hot halo at the horizon's edge
            ctx.strokeStyle='rgba('+HOT+','+(0.9*A).toFixed(3)+')';
            ctx.lineWidth=1.3;
            ctx.beginPath();ctx.arc(0,0,R0*1.02,0,7);ctx.stroke();
            ctx.strokeStyle='rgba('+HOT+','+(0.25*A).toFixed(3)+')';
            ctx.lineWidth=3.5;
            ctx.beginPath();ctx.arc(0,0,R0*1.05,0,7);ctx.stroke();
            // FRONT half of the disk — crosses in front of the sphere
            diskHalf(0,3.14159,1);
            ctx.globalCompositeOperation='source-over';
            ctx.restore();
          }
        }
        // dying stars spiral in and are gone
        for(let di=dying.length-1;di>=0;di--){
          const dn=dying[di]; dn.t+=reduceMotion?0.05:0.008;
          if(dn.t>=1){dying.splice(di,1);continue;}
          const p=dn.t*dn.t*(3-2*dn.t);                 // smoothstep — eased, no pops
          const swirl=(1-p)*46, an=dn.ph+p*9.5;
          const wp={x:dn.x+(hole.x-dn.x)*p+Math.cos(an)*swirl,
                    y:dn.y+(hole.y-dn.y)*p+Math.sin(an)*swirl*0.4,
                    z:dn.z+(hole.z-dn.z)*p+Math.sin(an)*swirl,
                    sx:0,sy:0,ss:1,sd:0,near:false,nf:1};
          projectNode(wp);
          if(wp.near)continue;
          const fa=(1-p*0.6)*(wp.nf===undefined?1:wp.nf);
          ctx.fillStyle='rgba('+FC(dn.fam).rgb+','+(0.9*fa).toFixed(3)+')';
          ctx.beginPath();ctx.arc(wp.sx,wp.sy,Math.max(0.8,dn.r*wp.ss*(1-p*0.8)),0,7);ctx.fill();
        }
      }

      // links — eased: base alpha melts down, highlight blooms up.
      // With a galaxy shape on: stretched cross-shape links FADE OUT (they were
      // the tangled mess), and survivors draw as curves sagging into the shape.
      const shaped=(S.shape||'natural')!=='natural';
      const shpNow=S.shape||'natural';
      const mp={x:0,y:0,z:0,sx:0,sy:0,ss:1,sd:0,near:false,nf:1};
      for(const l of links){
        const a=nodes[l.s],b=nodes[l.t];
        if(hiddenN(a)||hiddenN(b))continue;
        const depth=Math.max(0.15,Math.min(1,1-((a.sd+b.sd)/2)/420));
        const la=Math.min(1,S.linkAlpha);
        const col = (l.hl>0.05&&hn) ? FC(hn.fam).rgb : (a.fam===b.fam ? FC(a.fam).rgb : '120,140,185');
        const baseA = a.fam===b.fam ? Math.min(0.9,0.24*depth*S.linkAlpha) : Math.min(0.9,0.10*depth*S.linkAlpha);
        const nf2=Math.min(a.nf===undefined?1:a.nf, b.nf===undefined?1:b.nf);
        let alpha2 = (baseA*(1-0.82*l.dm) + 0.30*la*l.hl)*nf2;
        let shF=1;
        if(shaped){
          const dx3=a.x-b.x,dy3=a.y-b.y,dz3=a.z-b.z;
          const L=Math.sqrt(dx3*dx3+dy3*dy3+dz3*dz3);
          shF=Math.max(0,Math.min(1,1-(L-S.len*1.8)/(S.len*2.2)));
          shF=Math.max(shF,l.hl);        // hover still lights its own links
          alpha2*=shF;
        }
        l.shF=shF;
        if(alpha2<0.01)continue;
        ctx.strokeStyle='rgba('+col+','+Math.min(0.95,alpha2)+')';
        ctx.lineWidth=(0.55+0.35*l.hl)*S.linkW;
        if(shaped){
          // curve control point: the midpoint, herded toward the shape itself
          mp.x=(a.x+b.x)/2; mp.y=(a.y+b.y)/2; mp.z=(a.z+b.z)/2; mp.near=false;
          if(shpNow==='shell'){
            const r=Math.sqrt(mp.x*mp.x+mp.y*mp.y+mp.z*mp.z)||1;
            const tr=(Math.sqrt(a.x*a.x+a.y*a.y+a.z*a.z)+Math.sqrt(b.x*b.x+b.y*b.y+b.z*b.z))/2;
            const k2=tr/r; mp.x*=k2; mp.y*=k2; mp.z*=k2;   // arc hugs the sphere
          } else {
            mp.y*=0.35;                                    // arc sags into the plane
            if(shpNow==='ring'){
              const r=Math.sqrt(mp.x*mp.x+mp.z*mp.z)||1;
              const tr=(Math.sqrt(a.x*a.x+a.z*a.z)+Math.sqrt(b.x*b.x+b.z*b.z))/2;
              const k2=tr/r; mp.x*=k2; mp.z*=k2;           // arc follows the ring rim
            }
          }
          projectNode(mp);
          ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.quadraticCurveTo(mp.sx,mp.sy,b.sx,b.sy);ctx.stroke();
        } else {
          ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(b.sx,b.sy);ctx.stroke();
        }
      }
      // particles — fade with their link instead of vanishing
      if(links.length) for(const p of particles){
        p.t+=p.sp; if(p.t>1){p.t=0;p.l=(p.l+37);}
        const l=links[p.l%links.length],a=nodes[l.s],b=nodes[l.t];
        if(hiddenN(a)||hiddenN(b))continue;
        const pa=0.8*(1-0.9*(l.dm||0))*(l.shF===undefined?1:l.shF);
        if(pa<0.05)continue;
        const x=a.sx+(b.sx-a.sx)*p.t, y=a.sy+(b.sy-a.sy)*p.t, s=a.ss+(b.ss-a.ss)*p.t;
        ctx.fillStyle='rgba(200,235,255,'+pa+')';
        ctx.beginPath();ctx.arc(x,y,Math.max(0.5,0.9*s),0,7);ctx.fill();
      }
      // nodes
      // glows first, ALL in screen composite: additive light is order-independent,
      // so overlapping halos physically cannot flicker, however the stars cross
      if(S.glow>0.01){
        ctx.globalCompositeOperation='screen';
        for(const i of ord){
          const n=nodes[i];
          if(hiddenN(n))continue;
          const dim=n.dim||0; if(dim>0.97)continue;
          const depth=Math.max(0.25,Math.min(1.15,1-n.sd/500));
          const twA=0.18*S.twinkle;
          const tw=reduceMotion?1:(1-twA)+twA*Math.sin(t*1.4+n.tw*6.283);
          const lit=1+0.4*(n.litE||0);
          const rad=Math.min(70,n.r*n.ss*lit*S.nodeSize);
          const gr=Math.min(320,rad*(n.g==='log'?4:6)*Math.min(1.6,S.glow));
          // cull margin must exceed the halo's own size — glows were popping at screen edges
          if(n.sx<-gr-20||n.sx>W+gr+20||n.sy<-gr-20||n.sy>H+gr+20)continue;
          ctx.globalAlpha=Math.min(0.75,0.4*tw*depth*lit*S.glow*(1-0.9*dim)*(n.nf===undefined?1:n.nf));
          ctx.drawImage(glows[n.fam],n.sx-gr,n.sy-gr,gr*2,gr*2);
        }
        ctx.globalAlpha=1;
        ctx.globalCompositeOperation='source-over';
      }
      for(const i of ord){
        const n=nodes[i], c=FC(n.fam);
        if(hiddenN(n))continue;
        const isFocus=i===focusIdx;
        const dim=n.dim||0;                       // eased 0→1, no more hard cuts
        const depth=Math.max(0.25,Math.min(1.15,1-n.sd/500));
        const twA=0.18*S.twinkle;
        const tw=reduceMotion?1:(1-twA)+twA*Math.sin(t*1.4+n.tw*6.283);
        const lit=1+0.4*(n.litE||0);
        const rad=Math.min(70,n.r*n.ss*lit*S.nodeSize);
        if(n.sx<-150||n.sx>W+150||n.sy<-150||n.sy>H+150)continue;
        if((n.w>=14||isFocus)&&dim<0.9){
          ctx.strokeStyle='rgba('+c.rgb+','+(0.55*depth*(1-dim))+')';
          ctx.lineWidth=1.1;
          ctx.beginPath();ctx.arc(n.sx,n.sy,rad*1.9,0,7);ctx.stroke();
        }
        if(n.nova&&dim<0.9&&S.novas>0.02){
          const ph=reduceMotion?0.5:(t*0.28+n.tw)%1;   // slower, calmer pulse
          ctx.strokeStyle='rgba('+c.rgb+','+(0.35*(1-ph)*depth*(1-dim)*Math.min(1.5,S.novas)*(n.nf===undefined?1:n.nf))+')';
          ctx.lineWidth=1.2;
          ctx.beginPath();ctx.arc(n.sx,n.sy,rad*(1.6+ph*2.2),0,7);ctx.stroke();
        }
        const nf3=n.nf===undefined?1:n.nf;
        ctx.globalAlpha=Math.min(1,0.35+0.65*depth)*(1-0.55*dim)*nf3;
        ctx.fillStyle=(n.g==='log'?'rgba('+c.rgb+',0.75)':c.main);
        ctx.beginPath();ctx.arc(n.sx,n.sy,Math.max(0.8,rad),0,7);ctx.fill();
        if(n.g!=='log'&&dim<0.95){
          ctx.fillStyle='rgba(255,255,255,'+(0.55*tw*depth*(1-dim)*nf3)+')';
          ctx.beginPath();ctx.arc(n.sx,n.sy,rad*0.38,0,7);ctx.fill();
        }
        ctx.globalAlpha=1;
      }
      // near-side ring letters orbit IN FRONT of their constellation
      ctx.textAlign='center';
      for(const op of ringOps){
        ctx.save();ctx.translate(op.x,op.y);ctx.rotate(op.rot);
        ctx.font='italic '+op.fs+'px Georgia, serif';ctx.fillStyle=op.fill;
        ctx.fillText(op.ch,0,0);ctx.restore();
      }
      // ---- orbiting star names: LOD tiers, like a map's cities and towns ----
      // tier 1 = hub stars, always named · tier 2 = mid notes, appear as you close in
      // tier 3 = everything else, only up close. Each name arcs over its own star.
      // ---- star names as 3D MOONS: each name orbits its star in world space,
      // swinging behind (smaller, fainter) and in front. Rebuilt for stability:
      // hysteresis (no threshold blinking), sticky slots (no label wars), and
      // everything fades in/out — the flicker mechanisms are gone. ----
      if(S.names>0.02){
        // pass 1: who WANTS a name (hysteresis: enter high, exit low)
        for(const i of ord){
          const n=nodes[i];
          let tier;
          if(n.w>=8) tier=1;
          else if(n.w>=2&&n.g!=='log') tier=2;
          else tier=3;
          n.lblTier=tier;
          let ok=false;
          if(!hiddenN(n)&&(n.dim||0)<=0.85&&n.sx>=-80&&n.sx<=W+80&&n.sy>=-60&&n.sy<=H+60){
            const th=[0,0.8,1.5,2.3][tier];
            const sMul=n.ss*Math.sqrt(S.names);
            ok = n.lblOn ? sMul>th*0.85 : sMul>th*1.08;
          }
          n.lblWant=ok;
        }
        // pass 2: sticky slot assignment — current holders keep their spot,
        // newcomers only claim free space. Deterministic order, no oscillation.
        const cands=[];
        for(const i of ord){
          const n=nodes[i];
          if(!n.lblWant){n.lblOn=false;continue;}
          cands.push([(n.lblOn?100000:0)+(3-n.lblTier)*1000+n.w,i]);
        }
        cands.sort((a,b)=>(b[0]-a[0])||(a[1]-b[1]));
        const placedN=[]; const tierCount=[0,0,0,0];
        // TIERCAP imported from config/constants
        for(const [,i] of cands){
          const n=nodes[i];
          if(tierCount[n.lblTier]>=TIERCAP[n.lblTier]){n.lblOn=false;continue;}
          if(!n.lc){
            const lbl=n.id.length>26?n.id.slice(0,24)+'…':n.id;
            ctx.font='italic 100px Georgia, serif';
            const adv=[]; let tot=0;
            for(const chr of lbl){const w2=ctx.measureText(chr).width;adv.push(w2);tot+=w2;}
            n.lc={lbl,adv,tot};
          }
          const fs=(n.lblTier===1?13:n.lblTier===2?10.5:9)*Math.min(1.7,Math.sqrt(n.ss));
          const wpx=n.lc.tot*(fs/100)+fs*0.06;
          const box={x:n.sx-wpx/2-10,y:n.sy-n.r*n.ss-fs*2.4,w:wpx+20,h:fs*3};
          let clash=false;
          for(const b of placedN){if(box.x<b.x+b.w&&box.x+box.w>b.x&&box.y<b.y+b.h&&box.y+box.h>b.y){clash=true;break;}}
          if(clash){n.lblOn=false;continue;}
          placedN.push(box); tierCount[n.lblTier]++; n.lblOn=true;
        }
        // pass 3: eased draw — each visible name is a moon on a 3D orbit round its star
        ctx.textAlign='center';
        for(const i of ord){
          const n=nodes[i];
          const tgt=n.lblOn?1:0;
          n.lblA=(n.lblA||0)+(tgt-(n.lblA||0))*0.10;
          if(n.lblA<=0.03)continue;
          if(hiddenN(n)||!n.lc)continue;
          const ang=(reduceMotion?0:t*0.12)+i*2.4;
          const rW=n.r*2.6+13;
          const tmp={x:n.x+Math.cos(ang)*rW,y:n.y-n.r*0.8,z:n.z+Math.sin(ang)*rW,sx:0,sy:0,ss:1,sd:0,near:false,nf:1};
          projectNode(tmp);
          if(tmp.near)continue;
          const behind=tmp.sd>n.sd;
          const rel=Math.max(0.5,Math.min(1.4,tmp.ss/Math.max(0.001,n.ss)));
          const fs=(n.lblTier===1?13:n.lblTier===2?10.5:9)*Math.min(1.7,Math.sqrt(n.ss))*rel;
          const aa=Math.min(0.85,(n.lblTier===1?0.6:n.lblTier===2?0.5:0.42)
            *(1-(n.dim||0))*n.lblA*(behind?0.4:1)*(tmp.nf===undefined?1:tmp.nf));
          if(aa<=0.02)continue;
          ctx.fillStyle='rgba('+FC(n.fam).rgb+','+aa.toFixed(3)+')';
          ctx.font='italic '+fs+'px Georgia, serif';
          ctx.fillText(n.lc.lbl,tmp.sx,tmp.sy);
        }
      }

      // labels — mono, now only for hover / search focus / solo (arc names cover the rest)
      ctx.textAlign='center'; ctx.lineJoin='round';
      const candidates=[];
      for(const i of ord){
        const n=nodes[i];
        if(hiddenN(n))continue;
        if(n.sx<-60||n.sx>W+60||n.sy<-40||n.sy>H+40)continue;
        let pri=-1;
        if(i===hover||i===focusIdx) pri=1e6;
        else if(hn){ if(hn.nbr.has(i)&&n.g!=='log') pri=1000+n.w; }
        else if(famSolo&&n.fam===famSolo&&n.g!=='log') pri=80+n.w;
        if(pri>=0) candidates.push([pri,i]);
      }
      candidates.sort((a,b)=>b[0]-a[0]);
      const placed=[]; let drawn=0;
      for(const [,i] of candidates){
        if(drawn>=30)break;
        const n=nodes[i];
        const depth=Math.max(0.55,Math.min(1,1-n.sd/600));
        const fs=Math.max(10,Math.min(15,(9+n.w*0.15)*Math.sqrt(n.ss)));
        ctx.font=fs+'px Menlo, Consolas, monospace';
        const label=n.id.length>36?n.id.slice(0,34)+'…':n.id;
        const tw2=ctx.measureText(label).width;
        const lx=n.sx, ly=n.sy-n.r*n.ss-9;
        const box={x:lx-tw2/2-6,y:ly-fs-3,w:tw2+12,h:fs+8};
        let clash=false;
        for(const b2 of placed){
          if(box.x<b2.x+b2.w&&box.x+box.w>b2.x&&box.y<b2.y+b2.h&&box.y+box.h>b2.y){clash=true;break;}
        }
        if(clash)continue;
        placed.push(box); drawn++;
        ctx.strokeStyle='rgba(3,5,10,0.85)'; ctx.lineWidth=3;
        ctx.strokeText(label,lx,ly);
        ctx.fillStyle=(i===hover||i===focusIdx)?'#FFFFFF':'rgba(226,234,248,'+(0.92*depth)+')';
        ctx.fillText(label,lx,ly);
      }
      // still capture
      if(view.wantShot){
        view.wantShot=false;
        try{ shot.querySelector('img').src=canvas.toDataURL('image/png'); shot.classList.add('fsm-show'); }catch(_){}
      }
      view.rafId=requestAnimationFrame(frame);
    };
    view.rafId=requestAnimationFrame(frame);
  }
}

export default class FathomStarmapPlugin extends Plugin {
  async onload(){
    this.registerView(VIEW_TYPE, (leaf: WorkspaceLeaf) => new StarmapView(leaf, this));
    this.addRibbonIcon('star','Fathom Starmap',()=>this.activate());
    this.addCommand({id:'open-fathom-starmap', name:'Open starmap', callback:()=>this.activate()});
    this.addCommand({id:'export-wallpaper', name:'Export starmap as desktop wallpaper', callback:()=>this.exportWallpaper()});
  }
  async activate(){
    const {workspace}=this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
    if(!leaf){ leaf=workspace.getLeaf(true); await leaf.setViewState({type:VIEW_TYPE, active:true}); }
    workspace.revealLeaf(leaf);
  }
  async exportWallpaper(){
    // find the active starmap view
    const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
    if(!leaf){ new (require('obsidian') as any).Notice('Open the starmap first, then export.'); return; }
    const view = leaf.view as StarmapView;
    const data = view.getGraphData?.();
    if(!data || !data.nodes?.length){
      new (require('obsidian') as any).Notice('Starmap has no data yet — wait for it to load.');
      return;
    }
    const html = exportWallpaper(data.nodes, data.links, data.S);
    // write the HTML file into the vault root
    const path = 'fathom-wallpaper.html';
    try {
      const exists = this.app.vault.getAbstractFileByPath(path);
      if(exists) await this.app.vault.modify(exists as any, html);
      else await this.app.vault.create(path, html);
      new (require('obsidian') as any).Notice(
        'Wallpaper saved to ' + path + '\n\nPoint a wallpaper app (Plash, Wallpaper Engine, etc.) at this file.',
        8000
      );
    } catch(e) {
      new (require('obsidian') as any).Notice('Failed to save wallpaper: ' + (e as Error).message);
    }
  }
  onunload(){}
}

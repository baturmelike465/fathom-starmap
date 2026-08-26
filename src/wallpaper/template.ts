/* Wallpaper HTML template — a self-contained renderer that needs no Obsidian API.
   DATA_JSON is replaced at export time with the serialised graph snapshot. */

export function wallpaperHTML(dataJSON: string, settingsJSON: string, familiesJSON: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Fathom Starmap</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#03050A;cursor:default}
canvas{display:block;width:100%;height:100%}
#info{position:fixed;bottom:12px;right:16px;color:rgba(160,175,210,0.35);
  font:11px/1.4 Menlo,Consolas,monospace;pointer-events:none;text-align:right}
</style></head><body>
<canvas id="c"></canvas>
<div id="info">fathom starmap wallpaper</div>
<script>
(function(){
"use strict";
// ---- embedded data ----
var DATA=${dataJSON};
var S=${settingsJSON};
var FAMS=${familiesJSON};

// ---- helpers ----
function hash(a,b){var x=Math.sin(a*127.1+b*311.7)*43758.5453;return x-Math.floor(x);}
function rotHue(hex,deg){
  var r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
  var mx=Math.max(r,g,b),mn=Math.min(r,g,b),h=0,s=0,l=(mx+mn)/2;
  if(mx!==mn){var d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);
    h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}
  h=(h+deg/360)%1;var q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;
  var f=function(x){x=(x%1+1)%1;return x<1/6?p+(q-p)*6*x:x<0.5?q:x<2/3?p+(q-p)*(2/3-x)*6:p;};
  var R=Math.round(f(h+1/3)*255),G=Math.round(f(h)*255),B=Math.round(f(h-1/3)*255);
  return {css:'rgb('+R+','+G+','+B+')',rgb:R+','+G+','+B};
}
function FC(k){
  if(S.hue&&FAMS[k])return rotHue(FAMS[k].color,S.hue);
  return FAMS[k]||{color:'#888',rgb:'136,136,136'};
}

// ---- canvas ----
var canvas=document.getElementById('c'),ctx=canvas.getContext('2d');
var W=0,H=0,DPR=1;
var fogCv=document.createElement('canvas'),fogCtx=fogCv.getContext('2d');
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);
  W=window.innerWidth;H=window.innerHeight;
  canvas.width=W*DPR;canvas.height=H*DPR;
  fogCv.width=Math.max(2,Math.round(W*0.7));fogCv.height=Math.max(2,Math.round(H*0.7));
}
window.addEventListener('resize',resize);resize();

// ---- unpack nodes & links ----
var nodes=DATA.nodes,links=DATA.links;
for(var i=0;i<nodes.length;i++){
  var n=nodes[i];n.nbr=new Set(n.nbrArr||[]);n.sx=0;n.sy=0;n.ss=1;n.sd=0;n.near=false;n.nf=1;
}

// ---- backdrop stars ----
var BACKDROP_COUNT=240,BACKDROP_RADIUS_MIN=1700,BACKDROP_RADIUS_RANGE=1200;
var stars=[];
for(var i=0;i<BACKDROP_COUNT;i++){
  var u=hash(i,7)*2-1,th2=hash(i,13)*6.283;
  var rr=BACKDROP_RADIUS_MIN+hash(i,29)*BACKDROP_RADIUS_RANGE,sq=Math.sqrt(Math.max(0,1-u*u));
  stars.push({x:Math.cos(th2)*sq*rr,y:u*rr*0.85,z:Math.sin(th2)*sq*rr,b:0.25+hash(i,3)*0.6,l:i%3});
}

// ---- glow sprites ----
var glows={};
function makeGlow(fam){
  var c=document.createElement('canvas');c.width=128;c.height=128;
  var g=c.getContext('2d');
  var col=FC(fam);
  var gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba('+col.rgb+',0.45)');gr.addColorStop(0.4,'rgba('+col.rgb+',0.12)');
  gr.addColorStop(1,'rgba('+col.rgb+',0)');
  g.fillStyle=gr;g.fillRect(0,0,128,128);
  return c;
}
// ---- fog puff sprites ----
var puffs={};
function makePuff(fam){
  var c=document.createElement('canvas');c.width=64;c.height=64;
  var g=c.getContext('2d');
  var col=FC(fam);
  var gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba('+col.rgb+',0.22)');gr.addColorStop(0.5,'rgba('+col.rgb+',0.07)');
  gr.addColorStop(1,'rgba('+col.rgb+',0)');
  g.fillStyle=gr;g.fillRect(0,0,64,64);
  return c;
}
var famSet={};
for(var i=0;i<nodes.length;i++){famSet[nodes[i].fam]=true;}
for(var k in famSet){if(!glows[k])glows[k]=makeGlow(k);if(!puffs[k])puffs[k]=makePuff(k);}

// ---- particles (comets) ----
var particles=[];
var N=Math.round(S.comets||0);
for(var i=0;i<N;i++)particles.push({l:i*97,t:(i*0.137)%1,sp:0.0012+((i*53)%100)/100*0.002});

// ---- camera ----
var FOCAL=900;
var yaw=0.4,pitch=0.18,zoom=1;
var ctr={x:0,y:0,z:0};
// centre on the galaxy's centroid
var gcx=0,gcy=0,gcz=0;
for(var i=0;i<nodes.length;i++){gcx+=nodes[i].x;gcy+=nodes[i].y;gcz+=nodes[i].z;}
if(nodes.length){gcx/=nodes.length;gcy/=nodes.length;gcz/=nodes.length;}
ctr.x=gcx;ctr.y=gcy;ctr.z=gcz;

// ---- anchors for fog (high-weight nodes) ----
var anchors=[];
for(var i=0;i<nodes.length;i++){if(nodes[i].w>=3||nodes[i].g!=='log')anchors.push(nodes[i]);}
if(anchors.length>80)anchors.sort(function(a,b){return b.w-a.w;});
anchors=anchors.slice(0,80);

// ---- projection ----
function projectNode(n){
  var cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  var nx=n.x-ctr.x,ny=n.y-ctr.y,nz=n.z-ctr.z;
  var x=nx*cy+nz*sy,z=-nx*sy+nz*cy;
  var y=ny*cp-z*sp; z=ny*sp+z*cp;
  var den=FOCAL+z*zoom*0.9;
  n.near=den<140;
  n.nf=Math.min(1,Math.max(0,(den-140)/200));
  var s=Math.min(6,FOCAL/Math.max(140,den)*zoom);
  n.sx=W/2+x*s; n.sy=H/2+y*s; n.ss=s; n.sd=z;
}

// ---- draw order (big stars behind) ----
var ord=[];
for(var i=0;i<nodes.length;i++)ord.push(i);
ord.sort(function(a,b){return (nodes[b].r-nodes[a].r)||(a-b);});

// ---- shooting star ----
var shoot=null,shootTimer=1600;

// ---- render loop ----
var t0=performance.now();
var famF={};for(var k in famSet)famF[k]=0;

function frame(now){
  var t=(now-t0)/1000;
  // gentle idle spin
  yaw+=0.00035*(S.spin||1);
  // project all nodes
  for(var i=0;i<nodes.length;i++)projectNode(nodes[i]);

  // ---- background ----
  ctx.setTransform(DPR,0,0,DPR,0,0);
  var bg=ctx.createRadialGradient(W/2,H*0.42,0,W/2,H*0.42,Math.max(W,H)*0.8);
  bg.addColorStop(0,'#080D1A');bg.addColorStop(1,'#03050A');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

  // ---- backdrop stars ----
  if(S.stars>0.02){
    var sp={x:0,y:0,z:0,sx:0,sy:0,ss:1,sd:0,near:false,nf:1};
    for(var si=0;si<stars.length;si++){
      var s2=stars[si];sp.x=s2.x;sp.y=s2.y;sp.z=s2.z;
      projectNode(sp);if(sp.near)continue;
      if(sp.sx<-4||sp.sx>W+4||sp.sy<-4||sp.sy>H+4)continue;
      var twk=0.6+0.4*Math.sin(t*1.1+s2.x*0.02);
      ctx.fillStyle='rgba(190,205,235,'+Math.min(0.9,0.12*s2.b*twk*(s2.l+1)*S.stars)+')';
      ctx.fillRect(sp.sx,sp.sy,s2.l>1?1.6:1,s2.l>1?1.6:1);
    }
  }

  // ---- eased dim/lit (simplified: no hover in wallpaper) ----
  for(var i=0;i<nodes.length;i++){
    var n=nodes[i];n.dim=(n.dim||0)*0.91;n.litE=(n.litE||0)*0.85;
  }
  for(var li=0;li<links.length;li++){var l=links[li];l.hl=(l.hl||0)*0.88;l.dm=(l.dm||0)*0.91;}

  // ---- nebula fog ----
  if(S.nebula>0.02){
    fogCtx.setTransform(1,0,0,1,0,0);
    fogCtx.clearRect(0,0,fogCv.width,fogCv.height);
    fogCtx.setTransform(0.7,0,0,0.7,0,0);
    fogCtx.globalCompositeOperation='lighter';
    for(var ai=0;ai<anchors.length;ai++){
      var n=anchors[ai];if(n.near)continue;
      var sprite=puffs[n.fam];if(!sprite)continue;
      var baseR=Math.min(420,(62+n.w*5.5)*n.ss);
      var ext=baseR*2.4;
      if(n.sx<-ext||n.sx>W+ext||n.sy<-ext||n.sy>H+ext)continue;
      var puffN=n.ss>1.8?8:(n.w>=10?16:12);
      for(var p=0;p<puffN;p++){
        var h1=hash(ai,p),h2=hash(ai,p+50),h3=hash(ai,p+100);
        var ang=h1*6.283+t*0.03*(h2-0.5);
        var dist=baseR*(0.15+h2*0.75),R=baseR*(0.55+h3*0.9);
        var a=0.09*S.nebula*(0.6+0.4*Math.sin(t*0.2+h1*6.283))*(n.nf===undefined?1:n.nf);
        if(a<0.009)continue;
        fogCtx.globalAlpha=Math.max(0.008,a);
        fogCtx.drawImage(sprite,n.sx+Math.cos(ang)*dist-R,n.sy+Math.sin(ang)*dist-R,R*2,R*2);
      }
      if(S.dust>0.02){
        fogCtx.fillStyle='rgba('+FC(n.fam).rgb+',0.5)';
        for(var d=0;d<18;d++){
          var h1=hash(ai+300,d),h2=hash(ai+400,d);
          var ang=h1*6.283,dist=baseR*(0.2+h2*0.9);
          var twk2=0.25+0.45*Math.sin(t*1.6+h1*40);
          fogCtx.globalAlpha=Math.min(0.9,0.35*twk2*S.dust);
          fogCtx.fillRect(n.sx+Math.cos(ang)*dist,n.sy+Math.sin(ang)*dist,2.6,2.6);
        }
      }
    }
    fogCtx.globalAlpha=1;
    ctx.globalCompositeOperation='screen';
    ctx.drawImage(fogCv,0,0,W,H);
    ctx.globalCompositeOperation='source-over';
  }

  // ---- shooting star ----
  if(shoot){
    shoot.t+=0.03;
    if(shoot.t>1)shoot=null;
    else{
      var sx=shoot.x+shoot.dx*shoot.t,sy=shoot.y+shoot.dy*shoot.t;
      var g=ctx.createLinearGradient(sx,sy,sx-shoot.dx*0.12,sy-shoot.dy*0.12);
      g.addColorStop(0,'rgba(220,240,255,0.9)');g.addColorStop(1,'rgba(220,240,255,0)');
      ctx.strokeStyle=g;ctx.lineWidth=1.4;
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx-shoot.dx*0.12,sy-shoot.dy*0.12);ctx.stroke();
    }
  }else if(S.meteors>0.01&&--shootTimer<=0){
    shootTimer=Math.max(20,(1600+((now|0)%1400))/S.meteors);
    var fromLeft=((now|0)%2)===0;
    shoot={x:fromLeft?-50:W+50,y:H*0.12+((now|0)%Math.max(1,H*0.45|0)),dx:(fromLeft?1:-1)*(W*0.5),dy:H*0.22,t:0};
  }

  // ---- links ----
  for(var li=0;li<links.length;li++){
    var l=links[li],a=nodes[l.s],b=nodes[l.t];
    if(a.near||b.near)continue;
    var depth=Math.max(0.15,Math.min(1,1-((a.sd+b.sd)/2)/420));
    var col=a.fam===b.fam?FC(a.fam).rgb:'120,140,185';
    var baseA=a.fam===b.fam?Math.min(0.9,0.24*depth*S.linkAlpha):Math.min(0.9,0.10*depth*S.linkAlpha);
    var nf2=Math.min(a.nf===undefined?1:a.nf,b.nf===undefined?1:b.nf);
    var alpha2=baseA*nf2;
    if(alpha2<0.01)continue;
    ctx.strokeStyle='rgba('+col+','+Math.min(0.95,alpha2)+')';
    ctx.lineWidth=0.55*S.linkW;
    ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(b.sx,b.sy);ctx.stroke();
  }

  // ---- particles (comets) ----
  if(links.length)for(var pi=0;pi<particles.length;pi++){
    var p=particles[pi];
    p.t+=p.sp;if(p.t>1){p.t=0;p.l=(p.l+37);}
    var l=links[p.l%links.length],a=nodes[l.s],b=nodes[l.t];
    if(a.near||b.near)continue;
    var x=a.sx+(b.sx-a.sx)*p.t,y=a.sy+(b.sy-a.sy)*p.t;
    ctx.fillStyle='rgba(200,235,255,0.7)';
    ctx.beginPath();ctx.arc(x,y,0.9,0,7);ctx.fill();
  }

  // ---- glows ----
  if(S.glow>0.01){
    ctx.globalCompositeOperation='screen';
    for(var oi=0;oi<ord.length;oi++){
      var n=nodes[ord[oi]];if(n.near)continue;
      var depth=Math.max(0.25,Math.min(1.15,1-n.sd/500));
      var twA=0.18*S.twinkle;
      var tw=1-twA+twA*Math.sin(t*1.4+n.tw*6.283);
      var rad=Math.min(70,n.r*n.ss*S.nodeSize);
      var gr=Math.min(320,rad*(n.g==='log'?4:6)*Math.min(1.6,S.glow));
      if(n.sx<-gr-20||n.sx>W+gr+20||n.sy<-gr-20||n.sy>H+gr+20)continue;
      var gSprite=glows[n.fam];if(!gSprite)continue;
      ctx.globalAlpha=Math.min(0.75,0.4*tw*depth*S.glow*(n.nf===undefined?1:n.nf));
      ctx.drawImage(gSprite,n.sx-gr,n.sy-gr,gr*2,gr*2);
    }
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  }

  // ---- stars (solid dots) ----
  for(var oi=0;oi<ord.length;oi++){
    var n=nodes[ord[oi]],c=FC(n.fam);if(n.near)continue;
    var depth=Math.max(0.25,Math.min(1.15,1-n.sd/500));
    var twA=0.18*S.twinkle;
    var tw=1-twA+twA*Math.sin(t*1.4+n.tw*6.283);
    var rad=Math.min(70,n.r*n.ss*S.nodeSize);
    if(n.sx<-150||n.sx>W+150||n.sy<-150||n.sy>H+150)continue;
    // supernova ring
    if(n.nova&&S.novas>0.02){
      var ph=(t*0.28+n.tw)%1;
      ctx.strokeStyle='rgba('+c.rgb+','+(0.35*(1-ph)*depth*Math.min(1.5,S.novas)*(n.nf===undefined?1:n.nf))+')';
      ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(n.sx,n.sy,rad*(1.6+ph*2.2),0,7);ctx.stroke();
    }
    var nf3=n.nf===undefined?1:n.nf;
    ctx.globalAlpha=Math.min(1,0.35+0.65*depth)*nf3;
    ctx.fillStyle=(n.g==='log'?'rgba('+c.rgb+',0.75)':c.color||c.main||c.css);
    ctx.beginPath();ctx.arc(n.sx,n.sy,Math.max(0.8,rad),0,7);ctx.fill();
    if(n.g!=='log'){
      ctx.fillStyle='rgba(255,255,255,'+(0.55*tw*depth*nf3)+')';
      ctx.beginPath();ctx.arc(n.sx,n.sy,rad*0.38,0,7);ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
</script></body></html>`;
}

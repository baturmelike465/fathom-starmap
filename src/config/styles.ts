/* Plugin CSS — injected into the document head on view open.
   Kept in JS so the plugin remains a single main.js with no styles.css. */

export const CSS = `
.fsm-root{position:absolute;inset:0;overflow:hidden;background:#04060C;color:#C9D4E8;font-family:var(--font-monospace),Menlo,monospace}
.fsm-root canvas{position:absolute;inset:0;cursor:grab;touch-action:none}
.fsm-root canvas.fsm-drag{cursor:grabbing}
.fsm-cart{position:absolute;top:18px;left:22px;pointer-events:none;z-index:2}
.fsm-cart h1{font-family:Georgia,serif;font-weight:400;font-style:italic;font-size:clamp(20px,3vw,32px);color:#F2F6FF;margin:0;line-height:1.05}
.fsm-cart h1 em{color:#2EE6C8}
.fsm-cart p{margin:6px 0 0;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#55648A}
.fsm-legend{position:absolute;left:22px;bottom:56px;z-index:2;display:flex;flex-direction:column;gap:6px;font-size:10px;letter-spacing:.06em;max-height:46vh;overflow-y:auto;scrollbar-width:thin;padding-right:6px}
.fsm-legend .fsm-row{display:flex;align-items:center;gap:8px;color:#93A3C2;cursor:pointer;user-select:none;transition:opacity .25s}
.fsm-legend .fsm-row.fsm-off{opacity:.28}
.fsm-legend .fsm-dot{width:8px;height:8px;border-radius:50%;flex:none}
.fsm-tip{position:absolute;z-index:3;pointer-events:none;max-width:320px;background:rgba(8,12,24,.93);border:1px solid rgba(46,230,200,.28);padding:7px 11px;font-size:11px;color:#DCE6F7;border-radius:3px;display:none;line-height:1.5}
.fsm-tip .fsm-kind{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#2EE6C8;display:block;margin-bottom:2px}
.fsm-search{position:absolute;top:18px;right:22px;z-index:4;width:min(260px,60%)}
.fsm-search input{width:100%;background:rgba(8,12,24,.85);border:1px solid rgba(120,140,185,.3);color:#EAF1FC;font:11px var(--font-monospace),monospace;padding:8px 11px;border-radius:3px;outline:none}
.fsm-search input:focus{border-color:rgba(46,230,200,.6)}
.fsm-results{margin-top:4px;background:rgba(8,12,24,.95);border:1px solid rgba(120,140,185,.25);border-radius:3px;overflow:hidden auto;display:none;max-height:240px}
.fsm-results div{padding:6px 11px;font-size:10px;color:#B9C6DE;cursor:pointer;border-left:2px solid transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fsm-results div:hover,.fsm-results div.fsm-sel{background:rgba(46,230,200,.08);color:#F2F6FF}
.fsm-timeline{position:absolute;left:50%;transform:translateX(-50%);bottom:14px;z-index:4;display:flex;align-items:center;gap:10px;width:min(500px,84%);background:rgba(8,12,24,.75);border:1px solid rgba(120,140,185,.22);padding:8px 12px;border-radius:4px}
.fsm-timeline button{background:none;border:1px solid rgba(46,230,200,.45);color:#2EE6C8;font:10px var(--font-monospace),monospace;padding:4px 9px;border-radius:3px;cursor:pointer;letter-spacing:.08em;flex:none}
.fsm-timeline button:hover{background:rgba(46,230,200,.12)}
.fsm-timeline input[type=range]{flex:1;accent-color:#2EE6C8;cursor:pointer}
.fsm-timeline .fsm-date{font-size:9px;color:#8FA0C0;letter-spacing:.1em;flex:none;min-width:82px;text-align:right}
.fsm-util{position:absolute;right:22px;z-index:4;background:none;border:1px solid rgba(120,140,185,.3);color:#8FA0C0;font:12px var(--font-monospace),monospace;width:32px;height:28px;border-radius:3px;cursor:pointer}
.fsm-util.fsm-on{border-color:rgba(46,230,200,.6);color:#2EE6C8}
.fsm-caption{position:absolute;left:50%;transform:translateX(-50%);bottom:66px;z-index:3;pointer-events:none;max-width:88%;text-align:center;font-family:Georgia,serif;font-style:italic;font-size:clamp(14px,2vw,20px);color:#EAF1FC;opacity:0;transition:opacity .8s;text-shadow:0 2px 12px rgba(0,0,0,.8);line-height:1.35}
.fsm-caption .fsm-sub{display:block;font:9px var(--font-monospace),monospace;letter-spacing:.16em;text-transform:uppercase;color:#8FA0C0;margin-top:5px;font-style:normal}
.fsm-caption.fsm-show{opacity:1}
.fsm-shot{position:absolute;inset:0;z-index:9;background:rgba(2,4,9,.9);display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:4%}
.fsm-shot.fsm-show{display:flex}
.fsm-shot img{max-width:92%;max-height:74%;border:1px solid rgba(120,140,185,.35);border-radius:4px}
.fsm-shot p{font-size:10px;letter-spacing:.1em;color:#8FA0C0;text-transform:uppercase;margin:0}
.fsm-shot button{background:none;border:1px solid rgba(46,230,200,.5);color:#2EE6C8;font:10px var(--font-monospace),monospace;padding:6px 14px;border-radius:3px;cursor:pointer}
.fsm-root.fsm-zen .fsm-cart,.fsm-root.fsm-zen .fsm-legend,.fsm-root.fsm-zen .fsm-search,
.fsm-root.fsm-zen .fsm-timeline,.fsm-root.fsm-zen .fsm-hidezen,.fsm-root.fsm-zen .fsm-tip{display:none!important}
.fsm-panel{position:absolute;top:58px;right:60px;z-index:5;width:238px;max-height:calc(100% - 130px);overflow-y:auto;background:rgba(8,12,24,.94);border:1px solid rgba(120,140,185,.28);border-radius:5px;padding:12px 14px;display:none}
.fsm-panel.fsm-show{display:block}
.fsm-panel h4{margin:10px 0 6px;font:600 9px var(--font-monospace),monospace;letter-spacing:.16em;text-transform:uppercase;color:#2EE6C8}
.fsm-panel h4:first-child{margin-top:0}
.fsm-prow{margin:7px 0}
.fsm-prow .fsm-plbl{display:flex;justify-content:space-between;font-size:10px;color:#93A3C2;margin-bottom:3px}
.fsm-prow .fsm-pval{color:#DCE6F7}
.fsm-prow input[type=range]{width:100%;accent-color:#2EE6C8;cursor:pointer;height:3px}
.fsm-preset{background:none;border:1px solid rgba(120,140,185,.35);color:#93A3C2;font:10px var(--font-monospace),monospace;padding:4px 10px;border-radius:3px;cursor:pointer;margin-top:10px}
.fsm-preset:hover{border-color:rgba(46,230,200,.5);color:#2EE6C8}
`;

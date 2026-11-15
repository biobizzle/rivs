(()=>{
  'use strict';
  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const ease=t=>{const v=clamp(t);return v*v*(3-2*v)};
  const phase=(p,start,end)=>ease((p-start)/(end-start));
  const story=qs('.spatial-scroll');
  const stage=qs('#spatial-stage');
  const camera=qs('#camera');
  const intro=qs('#intro-overlay');
  const caption=qs('#story-caption');
  const captionIndex=qs('#caption-index');
  const captionLabel=qs('#caption-label');
  const captionTitle=qs('#caption-title');
  const detail=qs('#detail-label');
  const endMessage=qs('#scene-end-message');
  const progressBar=qs('#chapter-progress');
  const progressText=qs('#chapter-progress-text');
  const instruction=qs('#scroll-instruction');
  const light=qs('.camera-light-pass');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const lowData=!!navigator.connection?.saveData;
  let fit=1;
  let requested=false;
  let lastChapter='';
  const objects={
    rug: {delay:0,span:.17,from:[-180,230,0,24,.32],float:[-90,-340,180,-16,.76],direction:[-24,12,0,-8,.92]},
    sofa:{delay:.026,span:.22,from:[-220,-310,270,-19,.57],float:[-140,-240,215,-18,.72],direction:[-35,16,0,0,.98]},
    chair:{delay:.091,span:.18,from:[380,-330,350,29,.46],float:[350,-350,340,22,.63],direction:[-175,-4,0,-8,.91]},
    table:{delay:.118,span:.16,from:[130,-450,410,-34,.32],float:[-70,-390,480,38,.53],direction:[50,-7,0,8,.93]},
    art:{delay:.079,span:.15,from:[0,-250,390,-28,.48],float:[0,-245,360,-27,.66],direction:[-80,3,0,-6,.92]},
    plant:{delay:.139,span:.18,from:[290,210,230,25,.36],float:[210,-230,320,-22,.6],direction:[-125,-25,0,13,.87]},
    lamp:{delay:.062,span:.19,from:[-330,-190,310,-27,.52],float:[-160,-300,310,-35,.68],direction:[90,-8,0,9,.95]},
    books:{delay:.17,span:.16,from:[-190,320,210,33,.35],float:[0,-310,380,29,.71],direction:[75,8,0,-8,.85]}
  };
  function setFit(){
    const w=stage.clientWidth,h=stage.clientHeight;
    fit=Math.max(w/1600,h/900);
    if (w<720){fit=Math.max(fit,.76)}
  }
  function pose(values){return `translate3d(${values[0].toFixed(1)}px,${values[1].toFixed(1)}px,${values[2].toFixed(1)}px) rotateY(${(values[3]*.6).toFixed(1)}deg) rotateZ(${values[3].toFixed(1)}deg) scale(${values[4].toFixed(3)})`}
  function interpolate(a,b,t){return a.map((v,i)=>mix(v,b[i],t))}
  function setObject(el,c,p){
    const assembled=phase(p,.12+c.delay,.12+c.delay+c.span);
    const explode=phase(p,.49+c.delay*.28,.575+c.delay*.1);
    const resolve=phase(p,.586+c.delay*.1,.676+c.delay*.05);
    const entry=interpolate(c.from,[0,0,0,0,1],assembled);
    const exploding=interpolate(entry,c.float,explode);
    const final=interpolate(exploding,c.direction,resolve);
    const settled=phase(p,.655,.73);
    const value=interpolate(final,c.direction,settled);
    const o=assembled * (1-.22*explode*(1-resolve));
    el.style.opacity=o.toFixed(3);
    el.style.transform=pose(value)+(el.dataset.object==='rug'?' perspective(850px) rotateX(68deg) rotateZ(-5deg)':'');
    el.style.filter=(p>.745 && p<.9 && el.dataset.object==='plant')?`blur(${mix(0,2.5,phase(p,.74,.83)).toFixed(1)}px)`:'none';
  }
  function update(){
    requested=false;
    if(document.hidden)return;
    const r=story.getBoundingClientRect();
    const total=Math.max(1,r.height-window.innerHeight);
    const p=clamp(-r.top/total);
    const simple=reduced.matches||lowData;
    for(const [name,c] of Object.entries(objects)){
      const el=qs(`[data-object="${name}"]`);
      if(!el)continue;
      if(simple){el.style.opacity='1';el.style.transform='none';el.style.filter='none'}
      else setObject(el,c,p);
    }
    const isMobile=stage.clientWidth<=720;
    const assemblyDolly=phase(p,.27,.44);
    const detailDolly=phase(p,.695,.823);
    const exitDolly=phase(p,.86,.965);
    let zoom=1+assemblyDolly*.065+detailDolly*(isMobile?.36:.76);
    zoom=mix(zoom,isMobile?1.14:1.04,exitDolly);
    let panX=mix(0,isMobile?-38:-12,assemblyDolly);
    panX+=mix(0,isMobile?-80:-300,detailDolly);
    panX=mix(panX,isMobile?-45:-20,exitDolly);
    let panY=mix(0,isMobile?33:0,assemblyDolly);
    panY+=mix(0,isMobile?-175:-230,detailDolly);
    panY=mix(panY,10,exitDolly);
    const yaw=mix(0,-4,detailDolly)*(1-exitDolly);
    if(simple){zoom=isMobile?1.14:1;panX=0;panY=0}
    camera.style.transform=`translate(-50%,-50%) translate3d(${panX.toFixed(1)}px,${panY.toFixed(1)}px,0) scale(${(fit*zoom).toFixed(5)}) rotateY(${yaw.toFixed(2)}deg)`;
    const introOut=phase(p,.025,.15);
    intro.style.opacity=String(1-introOut);
    intro.style.transform=`translate3d(0,${(-32*introOut).toFixed(1)}px,0)`;
    const cIn=phase(p,.19,.27),cOut=phase(p,.79,.88);
    caption.style.opacity=String((cIn*(1-cOut)).toFixed(3));
    caption.style.transform=`translate3d(0,${(24*(1-cIn)).toFixed(1)}px,0)`;
    const detailIn=phase(p,.738,.78),detailOut=phase(p,.851,.89);
    detail.style.opacity=String((detailIn*(1-detailOut)).toFixed(3));
    detail.style.transform=`translate3d(0,${(20*(1-detailIn)).toFixed(1)}px,0)`;
    const ending=phase(p,.858,.934);
    endMessage.style.opacity=ending.toFixed(3);
    endMessage.style.transform=`translate3d(0,${(36*(1-ending)).toFixed(1)}px,0)`;
    endMessage.style.pointerEvents=ending>.8?'auto':'none';
    light.style.opacity=(.58*detailDolly*(1-exitDolly)).toFixed(2);
    progressBar.style.width=`${(p*100).toFixed(2)}%`;
    const chapter=p<.125?0:p<.415?1:p<.67?2:p<.87?3:4;
    const labels=['01 — THE EMPTY SPACE','02 — THE ASSEMBLY','03 — THE REIMAGINING','04 — THE EXPLORATION','05 — YOUR SPACE'];
    progressText.textContent=labels[chapter];
    instruction.textContent=chapter>=4?'THE STORY CONTINUES BELOW':'SCROLL TO CREATE ↓';
    if(chapter!==lastChapter){
      lastChapter=chapter;
      const chapters=[
        ['01 / 04','THE BEGINNING','First, a little space.'],
        ['01 / 04','THE ASSEMBLY','An idea becomes a room.'],
        ['02 / 04','THE TRANSFORMATION','A new point of view.'],
        ['03 / 04','THE DETAIL','Look a little closer.'],
        ['04 / 04','THE NEXT CHAPTER','Your space, your story.']
      ];
      [captionIndex.textContent,captionLabel.textContent,captionTitle.textContent]=chapters[chapter];
    }
  }
  function request(){if(!requested){requested=true;requestAnimationFrame(update)}}
  window.addEventListener('scroll',request,{passive:true});
  window.addEventListener('resize',()=>{setFit();request()},{passive:true});
  reduced.addEventListener?.('change',()=>{if(reduced.matches){window.scrollTo({top:story.offsetTop,behavior:'instant'})}request()});
  document.addEventListener('visibilitychange',request);
  setFit();request();
  const dialog=qs('#brief-dialog');
  let formerFocus=null;
  qsa('[data-open-brief]').forEach(b=>b.addEventListener('click',()=>{formerFocus=document.activeElement;dialog.showModal()}));
  qs('#close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
  dialog.addEventListener('close',()=>formerFocus?.focus?.());
  qs('#brief-form').addEventListener('submit',async event=>{
    event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
    const data=new FormData(form);
    const body=`RIVS — PROJECT BRIEF\nName: ${String(data.get('name')).trim()}\nSpace: ${data.get('type')}\nVision: ${String(data.get('vision')).trim()}\n\nDrafted in the RIVS concept preview. This form did not send a message.`;
    const status=qs('#form-status');
    try{await navigator.clipboard.writeText(body);status.textContent='Copied. The brief is on your clipboard; it has not been submitted.'}
    catch{status.textContent='Copy is not supported in this browser. Select and copy the text below.';const output=document.createElement('textarea');output.value=body;output.readOnly=true;output.setAttribute('aria-label','Your project brief');status.after(output);output.focus();output.select();}
  });
})();
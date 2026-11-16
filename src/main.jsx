import React, { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
const ExperienceCanvas = lazy(()=>import('./Scene.jsx'));

function clamp(value){return Math.max(0,Math.min(1,value));}
function interpolate(a,b,p){const t=clamp((p-a)/(b-a));return t*t*(3-2*t);}
function useMotionPreferences(){
 const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const cb=()=>setReduced(media.matches);media.addEventListener('change',cb);return ()=>media.removeEventListener('change',cb);},[]);
 const saveData=Boolean(navigator.connection?.saveData);return {reduced,saveData};
}
function isWebGLAvailable(){try{const canvas=document.createElement('canvas');return Boolean(canvas.getContext('webgl2')||canvas.getContext('webgl'));}catch{return false;}}
function ContactDialog({open,onClose}){
 const dialog=useRef(null);const [feedback,setFeedback]=useState('');
 useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&!el.open)el.showModal();if(!open&&el.open)el.close();},[open]);
 async function submit(event){event.preventDefault();const form=new FormData(event.currentTarget);const name=String(form.get('name')||'').trim(),email=String(form.get('email')||'').trim(),space=String(form.get('space')||'').trim();const message=`Hello RIVS,\n\nMy name is ${name}.\nMy email is ${email}.\n\nI'd like to discuss my space:\n${space}`;try{await navigator.clipboard.writeText(message);setFeedback('Copied. Your message is ready to share.');}catch{setFeedback(message);}}
 return <dialog ref={dialog} className="contact-dialog" onClose={onClose} onClick={(e)=>{if(e.target===dialog.current)onClose();}}>
   <form onSubmit={submit}><div className="dialog-heading"><div><span className="eyebrow">Begin with a conversation</span><h2>Tell us about your space.</h2></div><button className="close-dialog" aria-label="Close enquiry" type="button" onClick={onClose}>×</button></div>
    <label>Name<input name="name" autoComplete="name" placeholder="Your name" required /></label>
    <label>Email<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
    <label>Your space<textarea name="space" rows="4" required placeholder="A home, a room, an idea…" /></label>
    <p className="form-note">This concept preview prepares an enquiry to copy. It doesn’t send messages yet.</p>
    <button className="submit" type="submit">Copy enquiry</button><p className="form-feedback" aria-live="polite">{feedback}</p>
   </form></dialog>;
}
function App(){
 const section=useRef(null),progress=useRef(0),[visibleProgress,setVisibleProgress]=useState(0),[manifest,setManifest]=useState(null),[modelsIssue,setModelsIssue]=useState(false);
 const [contactOpen,setContactOpen]=useState(false),[menuOpen,setMenuOpen]=useState(false);
 const [compact,setCompact]=useState(()=>matchMedia('(max-width: 700px)').matches);
 const motion=useMotionPreferences(),canRender=useMemo(()=>isWebGLAvailable(),[]);
 const staticMode=motion.reduced||motion.saveData||!canRender;
 useEffect(()=>{let active=true;const controller=new AbortController();fetch('/models/manifest.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('3D asset manifest missing');return r.json()}).then(x=>{if(active)setManifest(x)}).catch(()=>{if(active)setModelsIssue(true)});return()=>{active=false;controller.abort();};},[]);
 useEffect(()=>{const media=matchMedia('(max-width: 700px)');const handler=()=>setCompact(media.matches);media.addEventListener('change',handler);return()=>media.removeEventListener('change',handler);},[]);
 useEffect(()=>{if(staticMode)return;let raf=0;const read=()=>{const node=section.current;if(!node)return;const rect=node.getBoundingClientRect(),range=Math.max(1,rect.height-innerHeight);const n=clamp(-rect.top/range);progress.current=n;setVisibleProgress(Math.round(n*120)/120);raf=0;};const onScroll=()=>{if(!raf)raf=requestAnimationFrame(read)};read();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll,{passive:true});return()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);if(raf)cancelAnimationFrame(raf);}},[staticMode]);
 const introAlpha=1-interpolate(.04,.16,visibleProgress);
 return <>
  <a className="skip-link" href="#enquire">Skip to enquiry</a>
  <header className="site-header"><a href="#top" className="identity" aria-label="RIVS home">RIVS<span>.</span></a>
   <nav className="desktop-navigation" aria-label="Primary"><a href="#top">Experience</a><a href="#enquire">About</a></nav>
   <a href="#enquire" className="header-action">Discuss a space <span aria-hidden="true">↗</span></a>
   <button className="menu-toggle" aria-label="Open menu" aria-controls="mobile-navigation" aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}><i/><i/></button>
   {menuOpen&&<nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile"><a onClick={()=>setMenuOpen(false)} href="#top">Experience</a><a onClick={()=>setMenuOpen(false)} href="#enquire">About</a><button type="button" onClick={()=>{setMenuOpen(false);setContactOpen(true)}}>Discuss a space</button></nav>}
  </header>
  <main>
   <section ref={section} className={`immersive-journey ${staticMode?'static-mode':''}`} id="top" aria-label="RIVS interior design experience">
    <div className="canvas-stage">
     {!staticMode&&manifest&&!modelsIssue ? <Suspense fallback={<div className="loading-scene" role="status">Preparing your space…</div>}><ExperienceCanvas progress={progress} compact={compact} manifest={manifest} /></Suspense> : <div className="still-scene" role="img" aria-label="Warm contemporary interior concept"><div className="still-window"/><div className="still-wall"/><div className="still-floor"/></div>}
     {!manifest&&!modelsIssue&&!staticMode&&<div className="loading-scene" role="status">Preparing your space…</div>}
     {modelsIssue&&<div className="loading-scene asset-error" role="status">The room isn’t available on this connection. <button type="button" onClick={()=>location.reload()}>Try again</button></div>}
     <div className="stage-shade" aria-hidden="true"/>
     <div className="stage-copy" style={{opacity:staticMode?1:introAlpha}}><p>Considered interiors</p><h1>Space to <em>feel.</em></h1></div>
     </div>
   </section>
   <section className="closing" id="enquire"><div className="closing-content"><p className="eyebrow">RIVS interiors</p><h2>Designed for the way <em>life feels.</em></h2><p>Every space begins with a conversation.</p><button className="closing-cta" onClick={()=>setContactOpen(true)}>Tell us about yours <span aria-hidden="true">↗</span></button></div><footer className="footer"><span>RIVS.</span><span>Built around living. <a className="credit-link" href="https://polyhaven.com/" target="_blank" rel="noreferrer">3D assets: Poly Haven</a></span></footer></section>
  </main>
  <ContactDialog open={contactOpen} onClose={()=>setContactOpen(false)}/>
 </>;
}
createRoot(document.getElementById('root')).render(<App/>);
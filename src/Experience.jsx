import React,{useState,useMemo,useEffect} from 'react';
import {ArrowLeft,ArrowRight,Check,AlertTriangle,Clapperboard,Layers3,MapPin,Users,FileText,Play,Pause,ArrowUpRight} from 'lucide-react';
import CinemaScene from './Scene.jsx';
import {DEFAULT_PLAN,VENUES,derivePlan,formatMoney} from './model.js';
import './experience.css';
import shotData from './camera-shots.json';

const chapters=[
 {label:'The space',title:'Somewhere ordinary.',copy:'A courtyard, a rooftop, an old print room. Start with a place. See what a single evening could make of it.',empty:true,guests:40,screen:'standard',projector:'beam',lighting:'dusk',camera:'orbit'},
 {label:'The transformation',title:'An evening takes shape.',copy:'Forty seats. A five-metre screen. Warm light across the room. The layout and its working plan take shape together.',guests:40,screen:'standard',projector:'beam',lighting:'night',camera:'orbit'},
 {label:'The consequence',title:'A bigger night changes things.',copy:'Eighty guests need more screen and projection power. The scene grows, the estimate changes—and a reservation conflict comes into view.',guests:80,screen:'large',projector:'aurora',lighting:'night',camera:'plan'},
 {label:'The resolution',title:'Beautiful is only half of it.',copy:'Switch to the available Atlas Pro. Keep a supervisor alongside the trainee. A convincing picture now has an achievable sample plan behind it.',guests:80,screen:'large',projector:'atlas',lighting:'night',camera:'equipment'},
 {label:'The handover',title:'The idea. The details. Together.',copy:'Carry the layout, equipment, crew and itemised estimate into one illustrated proposal. Open the workspace to review it and download your own.',guests:80,screen:'large',projector:'atlas',lighting:'night',camera:'audience'},
];

export default function Experience({onUsePlan,onOpenWorkspace}){
 const[step,setStep]=useState(0),[place,setPlace]=useState('courtyard'),[playing,setPlaying]=useState(false),[camera,setCamera]=useState(null);
 const chapter=chapters[step];
 const plan=useMemo(()=>({...DEFAULT_PLAN,venue:place,...Object.fromEntries(['guests','screen','projector','lighting'].map(k=>[k,chapter[k]]))}),[chapter,place]);
 const result=useMemo(()=>derivePlan(plan),[plan]);
 const venue=VENUES.find(v=>v.id===place);
 const select=n=>{setStep(n);setCamera(null)};
 useEffect(()=>{if(!playing)return;const id=setTimeout(()=>{if(step===chapters.length-1)setPlaying(false);else{setStep(n=>n+1);setCamera(null)}},7500);return()=>clearTimeout(id)},[playing,step]);
 useEffect(()=>{const pause=()=>{if(document.hidden)setPlaying(false)};document.addEventListener('visibilitychange',pause);return()=>document.removeEventListener('visibilitychange',pause)},[]);
 return <section className="experience" aria-label="Interactive screening story">
  <header className="experience-heading"><div><p className="eyebrow">AFTERLIGHT / A POP-UP CINEMA STUDIO</p><h1>Make a night of it<span>.</span></h1><p>Imagine the space. Work out the rest.</p></div><button className="button light" onClick={()=>onOpenWorkspace('studio')}>Open my workspace<ArrowUpRight size={17}/></button></header>
  <div className="experience-stage">
   <div className="experience-visual"><CinemaScene plan={plan} shot={shotData.shots.find(s=>s.id===['arrival','reveal','layout','equipment','guest'][step])} empty={!!chapter.empty} cameraMode={camera||chapter.camera} exploded={step===3} showControls={true}/><div className="experience-location"><MapPin size={15}/>{venue.name}<span>Imagined venue</span></div></div>
   <div className="experience-story"><div className="story-topline"><span>CHAPTER {step+1} / {chapters.length}</span><button className="story-play" aria-label={playing?'Pause walkthrough':'Play walkthrough'} aria-pressed={playing} onClick={()=>{if(!playing&&step===4)select(0);setPlaying(!playing)}}>{playing?<Pause size={16}/>:<Play size={16}/>} {playing?'Pause':'Play story'}</button></div><div className="story-words" key={step}><p className="story-kicker">{chapter.label}</p><h2>{chapter.title}</h2><p>{chapter.copy}</p></div>
    {step===0?<div className="story-venues" role="group" aria-label="Story venue">{VENUES.map(v=><button aria-pressed={v.id===place} key={v.id} onClick={()=>setPlace(v.id)}>{v.id==='courtyard'?'Courtyard':v.id==='rooftop'?'Rooftop':'Warehouse'}<span>{v.capacity} guests</span></button>)}</div>:<div className="story-facts"><div><Users size={18}/><span>Audience<strong>{plan.guests} guests</strong></span></div><div><Clapperboard size={18}/><span>Screen<strong>{plan.screen==='large'?'8 metres':'5 metres'}</strong></span></div><div><Layers3 size={18}/><span>Sample estimate<strong>{formatMoney(result.total)} <small>CAD</small></strong></span></div></div>}
    {step>0&&<div className={'story-status '+(result.ready?'ready':'attention')} role="status">{result.ready?<Check size={17}/>:<AlertTriangle size={17}/>}<span>{result.ready?'All five planning checks pass':result.conflicts[0].title}</span></div>}
    {step===4&&<button className="button story-use" onClick={()=>onUsePlan(plan)}>Use this plan<FileText size={17}/></button>}
    <div className="story-navigation"><button aria-label="Previous chapter" disabled={step===0} onClick={()=>{setPlaying(false);select(step-1)}}><ArrowLeft size={19}/></button><div className="chapter-dots" aria-label="Story chapters">{chapters.map((c,i)=><button key={c.label} aria-label={'Chapter '+(i+1)+': '+c.label} aria-current={step===i?'step':undefined} className={step===i?'current':''} onClick={()=>{setPlaying(false);select(i)}}/>)}</div><button aria-label="Next chapter" disabled={step===4} onClick={()=>{setPlaying(false);select(step+1)}}><ArrowRight size={19}/></button></div>
   </div>
  </div>
  <div className="experience-bottom"><span><span className="footer-dot"/>Explore freely. Your saved plan changes only when you choose “Use this plan”.</span><span>Fictional venues, people & rates.</span></div>
  <section className="experience-connections" aria-label="Connected planning tools"><div><p className="eyebrow">BEHIND THE SCREEN</p><h2>A picture with a plan behind it.</h2></div><button onClick={()=>onOpenWorkspace('resources')}><Layers3 size={23}/><span>Equipment & costs<small>Availability with consequences</small></span><ArrowRight size={19}/></button><button onClick={()=>onOpenWorkspace('crew')}><Users size={23}/><span>People & skills<small>A crew that can do the work</small></span><ArrowRight size={19}/></button><button onClick={()=>onOpenWorkspace('views')}><MapPin size={23}/><span>Presentation views<small>From arrival to the audience</small></span><ArrowRight size={19}/></button></section>
 </section>
}

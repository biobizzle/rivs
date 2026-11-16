import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const smooth = (a, b, value) => {
  const t = Math.min(1, Math.max(0, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const clamp = (a, low, high) => Math.min(high, Math.max(low, a));
const SEED = 826191;
function noise(i) { const v = Math.sin(i * 92.862 + SEED) * 43758.5453; return v - Math.floor(v); }

function makeTexture(kind, size = 1024) {
  const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n = noise(x * .11 + y * 123.1), line = Math.sin((x + Math.sin(y / 33) * 8) * .31);
      let r, g, b;
      if (kind === 'oak') {
        const plank = Math.floor(y / (size / 10));
        const v = 206 + (n - .5) * 18 + line * 6 + (noise(plank) - .5) * 26;
        const seam = y % (size / 10) < 2 || (x % (size / 2) < 2 && plank % 2 === 0);
        r = seam ? v - 38 : v + 7; g = seam ? v - 40 : v - 12; b = seam ? v - 40 : v - 33;
      } else if (kind === 'rug') {
        const border = x < 44 || y < 44 || x > size - 44 || y > size - 44;
        const cross = (Math.floor(x / 5) + Math.floor(y / 7)) % 2;
        const v = (border ? 155 : 180) + (n - .5) * 16 + cross * 4;
        r = v + 14; g = v + 4; b = v - 12;
      } else {
        const v = 234 + (n - .5) * 7;
        r = v + 3; g = v + 1; b = v - 5;
      }
      image.data[i] = r; image.data[i + 1] = g; image.data[i + 2] = b; image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  if (kind === 'oak') texture.repeat.set(2.3, 2.1);
  return texture;
}

function RoomShell() {
  const oak = useMemo(() => makeTexture('oak'), []);
  const plaster = useMemo(() => makeTexture('plaster', 512), []);
  const outdoor = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#e2eae8'); g.addColorStop(.65, '#f0ede0'); g.addColorStop(1, '#a2ae97');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 26; i++) {
      const x = noise(i + 80) * 512, y = 330 + noise(i + 45) * 80;
      ctx.fillStyle = `rgba(91,112,86,${.13 + noise(i + 10) * .15})`;
      ctx.beginPath(); ctx.ellipse(x, y, 21 + noise(i) * 50, 45 + noise(i + 2) * 80, 0, 0, Math.PI * 2); ctx.fill();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  useEffect(() => () => {oak.dispose(); plaster.dispose(); outdoor.dispose()}, [oak, plaster, outdoor]);
  const wall = <meshStandardMaterial map={plaster} color="#f9f9f4" roughness={.94} />;
  const trim = <meshStandardMaterial color="#eeeae1" roughness={.8} />;
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.026, .5]} receiveShadow>
      <planeGeometry args={[26, 25]} /><meshStandardMaterial map={oak} color="#fff6eb" roughness={.8} metalness={0}/>
    </mesh>
    <mesh position={[0, 5.7, -1]} rotation={[Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[25, 17]}/>{wall}</mesh>
    <mesh position={[2.25, 2.85, -6.15]} receiveShadow><boxGeometry args={[9.4, 5.7, .15]}/>{wall}</mesh>
    <mesh position={[-6.65, 2.85, -6.15]} receiveShadow><boxGeometry args={[1.5, 5.7, .15]}/>{wall}</mesh>
    <mesh position={[-4.175, .65, -6.15]} receiveShadow><boxGeometry args={[3.45, 1.3, .15]}/>{wall}</mesh>
    <mesh position={[-4.175, 5.03, -6.15]} receiveShadow><boxGeometry args={[3.45, 1.34, .15]}/>{wall}</mesh>
    <mesh position={[7, 2.85, -.85]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
      <planeGeometry args={[12, 5.7]}/>{wall}
    </mesh>
    <mesh position={[-4.18, 2.85, -6.42]}><planeGeometry args={[3.6, 3.5]}/><meshBasicMaterial map={outdoor} toneMapped={false}/></mesh>
    <mesh position={[-4.18, 2.85, -6.405]}><planeGeometry args={[3.6, 3.5]}/><meshPhysicalMaterial color="#dceff1" transparent opacity={.13} roughness={.12} metalness={0}/></mesh>
    {[-5.91, -4.18, -2.44].map((x,i)=><mesh key={'wi'+i} position={[x, 2.85, -6.29]} castShadow><boxGeometry args={[.095, 3.62, .21]}/>{trim}</mesh>)}
    {[1.16, 2.85, 4.54].map((y,i)=><mesh key={'wj'+i} position={[-4.18, y, -6.29]} castShadow><boxGeometry args={[3.5, .09, .2]}/>{trim}</mesh>)}
    {/* Folded light curtains, deliberately off to the side of the window. */}
    {Array.from({length:6},(_,i)=><mesh key={'cur'+i} position={[-5.82 + i*.16, 2.8, -6.03]}>
      <boxGeometry args={[.18, 4.18, .048]}/><meshStandardMaterial color="#fffdf2" transparent opacity={.4} roughness={.98} depthWrite={false}/>
    </mesh>)}
    <mesh position={[0, .07, -6]} receiveShadow><boxGeometry args={[14, .14, .23]}/>{trim}</mesh>
    <mesh position={[0, 5.59, -6]}><boxGeometry args={[14, .14, .26]}/>{trim}</mesh>
    <mesh position={[6.9, .09, -.5]} rotation={[0,-Math.PI/2,0]}><boxGeometry args={[11.7, .16, .18]}/>{trim}</mesh>
    {/* Architectural wall panels. */}
    {[.8, 3.6, 5.8].map((x,i)=><mesh key={'panel'+i} position={[x, 2.7, -6.005]}>
      <boxGeometry args={[.028, 3.2, .045]}/>{trim}
    </mesh>)}
  </group>;
}

function Art({ position, color = '#8e7360', shape = 'arches' }) {
  const map = useMemo(() => {
    const canvas = document.createElement('canvas');canvas.width = 600;canvas.height = 780;
    const c=canvas.getContext('2d');c.fillStyle='#efe3d3';c.fillRect(0,0,600,780);
    const g=c.createLinearGradient(60,40,540,700);g.addColorStop(0,'#c5a890');g.addColorStop(1,'#f1ddd0');
    c.fillStyle=g;
    if(shape==='arches') {
      c.beginPath();c.roundRect(80,140,420,610,[205,205,0,0]);c.fill();
      c.fillStyle=color;c.beginPath();c.roundRect(160,250,270,490,[135,135,0,0]);c.fill();
      c.fillStyle='#dab99d';c.beginPath();c.roundRect(225,330,175,400,[90,90,0,0]);c.fill();
    } else {
      c.fillStyle='#dcc0a6';c.beginPath();c.ellipse(300,330,195,245,-.25,0,Math.PI*2);c.fill();
      c.fillStyle=color;c.beginPath();c.ellipse(170,490,130,190,.3,0,Math.PI*2);c.fill();
      c.strokeStyle='#746a50';c.lineWidth=7;c.beginPath();c.moveTo(120,620);c.bezierCurveTo(440,150,200,180,470,90);c.stroke();
    }
    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;
  },[shape,color]);
  useEffect(()=>()=>map.dispose(),[map]);
  return <group position={position}>
    <mesh castShadow><boxGeometry args={[1.18,1.51,.085]}/><meshStandardMaterial color="#a17c53" roughness={.64}/></mesh>
    <mesh position={[0,0,.051]}><planeGeometry args={[1.075,1.41]}/><meshStandardMaterial map={map} roughness={.92}/></mesh>
  </group>;
}

function Rug({progress}) {
  const map=useMemo(()=>makeTexture('rug'),[]);
  const mesh=useRef();
  useEffect(()=>()=>map.dispose(),[map]);
  useFrame(()=>{
    const p=progress.current;
    if(!mesh.current)return;
    const t=smooth(.17,.34,p);
    mesh.current.scale.set(1,t,1);
    mesh.current.position.y=.034 + (1-t)*.12;
  });
  return <mesh ref={mesh} rotation={[-Math.PI/2,0,.08]} position={[-.45,.04,-1.65]} receiveShadow>
    <planeGeometry args={[4.3,3.65]}/><meshStandardMaterial map={map} roughness={.98} side={THREE.DoubleSide}/>
  </mesh>;
}

function Arrival({name,url,position,width,enter,offset,rotation=0,progress,unravel=1}) {
  const gltf=useGLTF(url);
  const root=useRef();
  const clone=useMemo(()=>{
    const object=gltf.scene.clone(true);
    object.traverse((child)=>{if(child.isMesh){child.castShadow=true;child.receiveShadow=true;}});
    const box=new THREE.Box3().setFromObject(object),size=new THREE.Vector3(),center=new THREE.Vector3();
    box.getSize(size);box.getCenter(center);
    const scale=width/Math.max(size.x,.001);
    object.scale.setScalar(scale);
    object.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);
    return object;
  },[gltf,width]);
  useFrame(()=>{
    const group=root.current;if(!group)return;
    const p=progress.current;
    const arrived=smooth(enter,enter+.13,p);
    const breakApart=Math.sin(Math.PI*clamp((p-.43)/.22,0,1))**2*unravel;
    const settled=smooth(.6,.75,p);
    group.position.set(
      position[0]+offset[0]*(1-arrived)+breakApart*(name==='table'?.7:-.4)*(1-settled*.4),
      offset[1]*(1-arrived)+breakApart*(.53+(name==='plant'?.4:0)),
      position[2]+offset[2]*(1-arrived)+breakApart*(name==='chair'?.7:-.3)
    );
    group.rotation.set((1-arrived)*.14+breakApart*.17,rotation+(1-arrived)*(.33)+breakApart*.2,(1-arrived)*-.18+breakApart*.21);
    const scale=.93+.07*arrived;
    group.scale.setScalar(scale);
  });
  return <group ref={root} position={position}><primitive object={clone}/></group>;
}

function Lamp({ progress }) {
  const g=useRef();
  useFrame(()=>{if(!g.current)return;const p=progress.current,t=smooth(.23,.4,p);
    g.current.position.set(3.9+(1-t)*2.4,(1-t)*3.3, -3.65-(1-t)*1.3);
    g.current.rotation.z=(1-t)*.4;
  });
  return <group ref={g}>
    <mesh position={[0,.025,0]} castShadow><cylinderGeometry args={[.31,.35,.05,48]}/><meshStandardMaterial color="#2b2821" metalness={.75} roughness={.24}/></mesh>
    <mesh position={[0,1.2,0]} castShadow><cylinderGeometry args={[.022,.022,2.35,24]}/><meshStandardMaterial color="#3a332c" metalness={.8} roughness={.2}/></mesh>
    <mesh position={[-.42,2.36,0]} rotation={[0,0,-1.25]} castShadow><cylinderGeometry args={[.022,.022,.92,20]}/><meshStandardMaterial color="#3a332c" metalness={.8} roughness={.2}/></mesh>
    <mesh position={[-.84,2.25,0]} castShadow><coneGeometry args={[.42,.52,48,1,true]}/><meshStandardMaterial color="#ddd2bd" side={THREE.DoubleSide} metalness={.04} roughness={.7}/></mesh>
    <mesh position={[-.84,2.03,0]}><sphereGeometry args={[.12,16,12]}/><meshStandardMaterial color="#ffe1b4" emissive="#eab77e" emissiveIntensity={1.1}/></mesh>
    <pointLight position={[-.84,2.05,0]} intensity={1.1} distance={3.5} color="#ffddab"/>
  </group>;
}

function Cabinet() {
  return <group position={[5.15,0,-5.4]}>
    <mesh position={[0,.68,0]} castShadow receiveShadow><boxGeometry args={[1.9,1.36,.52]}/><meshStandardMaterial color="#795f44" roughness={.65}/></mesh>
    {[0,.68].map((y,i)=><mesh key={i} position={[0,.32+i*.58,.272]}><boxGeometry args={[1.78,.015,.015]}/><meshStandardMaterial color="#3a291c" roughness={.6}/></mesh>)}
    <mesh position={[0,1.4,0]} castShadow><boxGeometry args={[2.02,.08,.57]}/><meshStandardMaterial color="#a18466" roughness={.55}/></mesh>
  </group>;
}

function Details({ progress }) {
  const g=useRef();
  useFrame(()=>{const t=smooth(.28,.45,progress.current);if(!g.current)return;g.current.position.y=(1-t)*1.5;g.current.scale.setScalar(.94+.06*t);g.current.visible=t>.01;});
  return <group ref={g}>
    <Art position={[3.05,3.0,-6.005]} shape="arches" color="#8c725c"/>
    <Art position={[4.44,2.78,-6.005]} shape="organic" color="#7c7469"/>
    <Cabinet/>
    <mesh position={[5.15,1.58,-5.43]} castShadow><cylinderGeometry args={[.14,.22,.38,32]}/><meshStandardMaterial color="#d5c0ac" roughness={.86}/></mesh>
    <mesh position={[5.15,1.95,-5.43]} castShadow><sphereGeometry args={[.2,20,12]}/><meshStandardMaterial color="#546349" roughness={.84}/></mesh>
  </group>;
}

function CameraRig({progress, compact}) {
  const { camera }=useThree();
  const target=useRef(new THREE.Vector3(0,1.35,-2.1));
  useFrame((state,delta)=>{
    const p=progress.current,dolly=smooth(.68,.93,p), pan=smooth(.78,.97,p);
    const first=compact?[7.5,4.5,19.9]:[4.6,3.25,12.6];
    const last=compact?[5.8,3.5,13.8]:[2.8,2.62,5.8];
    const x=THREE.MathUtils.lerp(first[0],last[0],dolly), y=THREE.MathUtils.lerp(first[1],last[1],dolly),z=THREE.MathUtils.lerp(first[2],last[2],dolly);
    const desired=new THREE.Vector3(x,y,z);
    camera.position.lerp(desired,1-Math.exp(-delta*4.5));
    target.current.lerp(new THREE.Vector3(THREE.MathUtils.lerp(-.3,1.4,pan),THREE.MathUtils.lerp(1.68,1.4,dolly),THREE.MathUtils.lerp(-2,-3.2,dolly)),1-Math.exp(-delta*4));
    camera.lookAt(target.current);
    const fov=THREE.MathUtils.lerp(compact?39:39, compact?43:37, dolly);
    if(Math.abs(camera.fov-fov)>.01){camera.fov=fov;camera.updateProjectionMatrix();}
  });
  return null;
}

function Interior({progress,compact,manifest}) {
  const model=(slug)=>`/models/${slug}/${slug}_1k.gltf`;
  return <>
    <color attach="background" args={['#e9e3d8']} />
    
    <hemisphereLight args={['#f3f7f0','#a88965',2.1]}/>
    <ambientLight intensity={.5}/>
    <directionalLight position={[-4.5,8,4]} intensity={4.5} color="#fff5e9" castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-.00012} shadow-normalBias={.02}/>
    <directionalLight position={[4.5,5,3]} intensity={.8} color="#eee9da" />
    <RoomShell/>
    <Rug progress={progress}/>
    {manifest.sofa_03&&<Arrival name="sofa" url={model('sofa_03')} position={[-1.1,0,-3.3]} width={2.75} enter={.07} offset={[-3.1,2.35,-2.8]} rotation={-.05} progress={progress}/>} 
    {manifest.modern_arm_chair_01&&<Arrival name="chair" url={model('modern_arm_chair_01')} position={[2.3,0,-1.9]} width={.96} enter={.17} offset={[3,1.85,1.2]} rotation={-.52} progress={progress}/>} 
    {manifest.modern_coffee_table_01&&<Arrival name="table" url={model('modern_coffee_table_01')} position={[-.5,0,-.5]} width={1.46} enter={.24} offset={[.8,2.9,3.4]} rotation={.1} progress={progress}/>} 
    {manifest.potted_plant_02&&<Arrival name="plant" url={model('potted_plant_02')} position={[-3.75,0,-4.6]} width={.82} enter={.3} offset={[-2,2.1,-1.5]} rotation={.3} progress={progress}/>} 
    <Lamp progress={progress}/>
    <Details progress={progress}/>
    <CameraRig progress={progress} compact={compact}/>
  </>;
}

class SceneBoundary extends React.Component {
  constructor(props){super(props);this.state={error:null};}
  static getDerivedStateFromError(error){return {error};}
  componentDidCatch(error){console.error('[RIVS] 3D scene failed',error);}
  render(){return this.state.error? <div className="fallback-room" role="status"><p>The room couldn’t load on this connection.</p><button type="button" onClick={()=>location.reload()}>Try again</button></div>:this.props.children;}
}

export default function ExperienceCanvas({progress,compact,manifest}) {
  return <SceneBoundary>
    <Canvas className="interior-canvas" shadows dpr={compact?[1,1.4]:[1,2]}
      gl={{alpha:false,antialias:true,powerPreference:'high-performance',toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.23}}
      camera={{position:compact?[7.5,4.5,19.9]:[4.6,3.25,12.6],fov:39,near:.1,far:70}}
      onCreated={({gl})=>{gl.outputColorSpace=THREE.SRGBColorSpace;gl.setClearColor('#ebe5dd');}}>
      <Suspense fallback={null}>
        <Interior progress={progress} compact={compact} manifest={manifest}/>
      </Suspense>
    </Canvas>
  </SceneBoundary>;
}

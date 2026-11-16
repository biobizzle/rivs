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
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#c6dbe0'); gradient.addColorStop(.6, '#e9ece5'); gradient.addColorStop(1, '#a0ae98');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 28; i++) {
      const x = noise(i + 80) * 512;
      const y = 325 + noise(i + 44) * 100;
      ctx.fillStyle = `rgba(75,100,79,${.12 + noise(i + 10) * .19})`;
      ctx.beginPath();ctx.ellipse(x,y,18+noise(i)*49,45+noise(i+2)*76,0,0,Math.PI*2);ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => { oak.dispose(); plaster.dispose(); outdoor.dispose(); }, [oak, plaster, outdoor]);

  // The room is a single, walk-in volume. The window is cut into the LEFT
  // return wall; there is no opening behind the sofa or any furniture.
  const wallFinish = <meshStandardMaterial map={plaster} color="#e9e6de" roughness={.91} />;
  const paintedTrim = <meshStandardMaterial color="#e4dfd5" roughness={.76} />;
  const wallBlock = (key, position, size) => <mesh key={key} position={position} receiveShadow castShadow>
    <boxGeometry args={size}/>{wallFinish}
  </mesh>;
  return <group>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.035,-.15]} receiveShadow>
      <planeGeometry args={[13,13.1]}/>
      <meshStandardMaterial map={oak} color="#e4d5be" roughness={.86} metalness={0}/>
    </mesh>
    {/* Full back wall is the anchor of the composition, not a photo panel. */}
    {wallBlock('back',[0,2.58,-6.05],[12.2,5.16,.18])}
    {wallBlock('right',[6.04,2.58,-.1],[.18,5.16,12])}
    {/* Window opening: 2.8 metres along the LEFT wall. */}
    {wallBlock('left-rear',[-6.04,2.58,-4.91],[.18,5.16,2.29])}
    {wallBlock('left-front',[-6.04,2.58,2.43],[.18,5.16,6.9])}
    {wallBlock('left-sill',[-6.04,.61,-2.37],[.18,1.22,2.81])}
    {wallBlock('left-lintel',[-6.04,4.62,-2.37],[.18,1.08,2.81])}
    <mesh position={[-6.16,2.56,-2.37]} rotation={[0,Math.PI/2,0]}>
      <planeGeometry args={[2.81,2.82]}/>
      <meshBasicMaterial map={outdoor} toneMapped={false} side={THREE.DoubleSide}/>
    </mesh>
    <mesh position={[-5.933,2.56,-2.37]} rotation={[0,Math.PI/2,0]}>
      <planeGeometry args={[2.78,2.82]}/>
      <meshPhysicalMaterial color="#dfe8e3" transparent opacity={.09} roughness={.15} depthWrite={false} side={THREE.DoubleSide}/>
    </mesh>
    {[-3.78,-2.37,-.96].map((z,i)=><mesh key={'wm'+i} position={[-5.93,2.56,z]} castShadow>
      <boxGeometry args={[.1,2.83,.085]}/>{paintedTrim}
    </mesh>)}
    {[1.15,2.56,3.98].map((y,i)=><mesh key={'wh'+i} position={[-5.93,y,-2.37]} castShadow>
      <boxGeometry args={[.095,.085,2.84]}/>{paintedTrim}
    </mesh>)}
    {/* Subtle skirting and crown give the room readable corners and scale. */}
    <mesh position={[0,.11,-5.91]}><boxGeometry args={[12.06,.19,.18]}/>{paintedTrim}</mesh>
    <mesh position={[5.9,.11,-.1]}><boxGeometry args={[.18,.19,12]}/>{paintedTrim}</mesh>
    <mesh position={[-5.9,.11,2.35]}><boxGeometry args={[.18,.19,6.7]}/>{paintedTrim}</mesh>
    <mesh position={[0,5.08,-5.9]}><boxGeometry args={[12.04,.12,.19]}/>{paintedTrim}</mesh>
    <mesh position={[5.91,5.08,-.1]}><boxGeometry args={[.17,.12,11.9]}/>{paintedTrim}</mesh>
    <mesh position={[0,5.16,-.13]} rotation={[Math.PI/2,0,0]} receiveShadow>
      <planeGeometry args={[12.3,12.1]}/>
      <meshStandardMaterial color="#e6dfd2" roughness={.96} side={THREE.DoubleSide}/>
    </mesh>
    {/* Architectural wall moulding, held well above the sofa. */}
    {[-.1,2.2,4.48].map((x,i)=><mesh key={'panel'+i} position={[x,3.2,-5.94]}>
      <boxGeometry args={[.026,2.25,.038]}/>{paintedTrim}
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
    if(!mesh.current)return;
    const t=smooth(.19,.265,progress.current);
    mesh.current.visible=t>.001;
    // Unroll on the floor, never rise through the furniture or window.
    mesh.current.scale.set(1,Math.max(.001,t),1);
    mesh.current.position.y=.025+(1-t)*.015;
  });
  return <mesh ref={mesh} visible={false} rotation={[-Math.PI/2,0,0]} position={[-.2,.025,-2.38]} receiveShadow>
    <planeGeometry args={[4.8,3.45]}/><meshStandardMaterial map={map} roughness={.98} side={THREE.DoubleSide}/>
  </mesh>;
}

function Arrival({url,position,width,enter,offset,rotation=0,progress}) {
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
    const t=smooth(enter,enter+.085,progress.current);
    group.visible=t>.003;
    // Each object moves independently from an entrance path and settles on
    // the floor. No furniture is visible before its scroll chapter.
    group.position.set(position[0]+offset[0]*(1-t),offset[1]*(1-t),position[2]+offset[2]*(1-t));
    group.rotation.set((1-t)*.065,rotation+(1-t)*.28,(1-t)*-.08);
    group.scale.setScalar(.94+.06*t);
  });
  return <group ref={root} visible={false} position={position}><primitive object={clone}/></group>;
}

function Lamp({ progress }) {
  const g=useRef();
  useFrame(()=>{if(!g.current)return;const p=progress.current,t=smooth(.70,.765,p);
    g.current.visible=t>.003;
    g.current.position.set(4.58+(1-t)*2.3,(1-t)*.9, -4.2+(1-t)*3.1);
    g.current.rotation.z=(1-t)*.4;
  });
  return <group ref={g} visible={false}>
    <mesh position={[0,.025,0]} castShadow><cylinderGeometry args={[.31,.35,.05,48]}/><meshStandardMaterial color="#2b2821" metalness={.75} roughness={.24}/></mesh>
    <mesh position={[0,1.2,0]} castShadow><cylinderGeometry args={[.022,.022,2.35,24]}/><meshStandardMaterial color="#3a332c" metalness={.8} roughness={.2}/></mesh>
    <mesh position={[-.42,2.36,0]} rotation={[0,0,-1.25]} castShadow><cylinderGeometry args={[.022,.022,.92,20]}/><meshStandardMaterial color="#3a332c" metalness={.8} roughness={.2}/></mesh>
    <mesh position={[-.84,2.25,0]} castShadow><coneGeometry args={[.42,.52,48,1,true]}/><meshStandardMaterial color="#ddd2bd" side={THREE.DoubleSide} metalness={.04} roughness={.7}/></mesh>
    <mesh position={[-.84,2.03,0]}><sphereGeometry args={[.12,16,12]}/><meshStandardMaterial color="#ffe1b4" emissive="#eab77e" emissiveIntensity={1.1}/></mesh>
    <pointLight position={[-.84,2.05,0]} intensity={1.1} distance={3.5} color="#ffddab"/>
  </group>;
}

function Cabinet() {
  return <group position={[4.65,0,-5.37]}>
    <mesh position={[0,.68,0]} castShadow receiveShadow><boxGeometry args={[1.9,1.36,.52]}/><meshStandardMaterial color="#795f44" roughness={.65}/></mesh>
    {[0,.68].map((y,i)=><mesh key={i} position={[0,.32+i*.58,.272]}><boxGeometry args={[1.78,.015,.015]}/><meshStandardMaterial color="#3a291c" roughness={.6}/></mesh>)}
    <mesh position={[0,1.4,0]} castShadow><boxGeometry args={[2.02,.08,.57]}/><meshStandardMaterial color="#a18466" roughness={.55}/></mesh>
  </group>;
}

function Details({ progress }) {
  const g=useRef();
  useFrame(()=>{const t=smooth(.78,.845,progress.current);if(!g.current)return;g.current.position.y=(1-t)*.6;g.current.scale.setScalar(.98+.02*t);g.current.visible=t>.003;});
  return <group ref={g} visible={false}>
    <Art position={[2.1,3.12,-5.91]} shape="arches" color="#8c725c"/>
    <Art position={[3.5,3.12,-5.91]} shape="organic" color="#7c7469"/>
    <Cabinet/>
    <mesh position={[4.65,1.58,-5.43]} castShadow><cylinderGeometry args={[.14,.22,.38,32]}/><meshStandardMaterial color="#d5c0ac" roughness={.86}/></mesh>
    <mesh position={[4.65,1.95,-5.43]} castShadow><sphereGeometry args={[.2,20,12]}/><meshStandardMaterial color="#546349" roughness={.84}/></mesh>
  </group>;
}

function CameraRig({progress,compact}) {
  const {camera}=useThree();
  const target=useRef(new THREE.Vector3(0,1.95,-2.4));
  const cameraGoal=useRef(new THREE.Vector3());
  const lookGoal=useRef(new THREE.Vector3());
  useFrame((state,delta)=>{
    const p=progress.current;
    // First scroll: enter the EMPTY room. No object arrives until this finishes.
    const enter=smooth(.02,.165,p);
    // Final scroll: dolly through the COMPLETED room, never during assembly.
    const finish=smooth(.875,.995,p);
    const start=compact?[.55,2.75,24.0]:[.9,2.73,14.8];
    const settle=compact?[.35,2.55,19.0]:[.72,2.44,10.5];
    const explore=compact?[1.1,2.14,12.6]:[1.15,1.96,4.95];
    cameraGoal.current.set(
      THREE.MathUtils.lerp(THREE.MathUtils.lerp(start[0],settle[0],enter),explore[0],finish),
      THREE.MathUtils.lerp(THREE.MathUtils.lerp(start[1],settle[1],enter),explore[1],finish),
      THREE.MathUtils.lerp(THREE.MathUtils.lerp(start[2],settle[2],enter),explore[2],finish)
    );
    lookGoal.current.set(
      THREE.MathUtils.lerp(0, .5,finish),
      THREE.MathUtils.lerp(2.03,1.42,finish),
      THREE.MathUtils.lerp(-2.2,-3.65,finish)
    );
    // Smooth but deterministic: reversing scroll reverses the entire scene.
    const damping=1-Math.exp(-delta*6.8);
    camera.position.lerp(cameraGoal.current,damping);
    target.current.lerp(lookGoal.current,damping);
    camera.lookAt(target.current);
    const fov=THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(compact?60:53,compact?56:49,enter),
      compact?51:42, finish
    );
    if(Math.abs(camera.fov-fov)>.02){camera.fov=fov;camera.updateProjectionMatrix();}
  });
  return null;
}

function Interior({progress,compact,manifest}) {
  const model=(slug)=>`/models/${slug}/${slug}_1k.gltf`;
  return <>
    <color attach="background" args={['#ded7cc']}/>
    <hemisphereLight args={['#f9f6ee','#9e8b77',1.05]}/>
    <ambientLight intensity={.25}/>
    <directionalLight position={[-5.8,8.5,2.9]} intensity={2.55} color="#fff6e9" castShadow shadow-mapSize={compact?[1024,1024]:[2048,2048]} shadow-camera-left={-9} shadow-camera-right={9} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-bias={-.00014} shadow-normalBias={.025}/>
    <directionalLight position={[4.5,5.5,5]} intensity={.36} color="#e3e9e5"/>
    <RoomShell/>
    <Rug progress={progress}/>
    {manifest.sofa_03&&<Arrival url={model('sofa_03')} position={[-.72,0,-4.25]} width={3.05} enter={.275} offset={[-4.6,1.1,4.5]} rotation={-.03} progress={progress}/>} 
    {manifest.modern_arm_chair_01&&<Arrival url={model('modern_arm_chair_01')} position={[3.08,0,-2.08]} width={1.16} enter={.405} offset={[3.4,1.05,3.8]} rotation={-.48} progress={progress}/>} 
    {manifest.modern_coffee_table_01&&<Arrival url={model('modern_coffee_table_01')} position={[-.15,0,-1.69]} width={1.56} enter={.515} offset={[.4,1.1,5.4]} rotation={.03} progress={progress}/>} 
    {manifest.potted_plant_02&&<Arrival url={model('potted_plant_02')} position={[-4.66,0,-4.28]} width={.92} enter={.615} offset={[-1.1,.82,4.2]} rotation={.25} progress={progress}/>} 
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
      gl={{alpha:false,antialias:true,powerPreference:'high-performance',toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:0.92}}
      camera={{position:compact?[.55,2.75,24]:[.9,2.73,14.8],fov:compact?60:53,near:.1,far:70}}
      onCreated={({gl})=>{gl.outputColorSpace=THREE.SRGBColorSpace;gl.setClearColor('#ebe5dd');}}>
      <Suspense fallback={null}>
        <Interior progress={progress} compact={compact} manifest={manifest}/>
      </Suspense>
    </Canvas>
  </SceneBoundary>;
}
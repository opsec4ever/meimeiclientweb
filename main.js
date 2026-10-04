import * as THREE from 'three';

const mobile=matchMedia('(pointer:coarse)').matches||innerWidth<800;
const CHUNK_SIZE=16,WORLD_HEIGHT=mobile?40:64,RENDER_DISTANCE=mobile?0:2,WATER_LEVEL=mobile?15:20,seed=928374;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x78a9d5);
scene.fog=new THREE.Fog(0x78a9d5,70,190);

const camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.05,300);
camera.rotation.order='YXZ';

const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setPixelRatio(mobile?0.65:Math.min(devicePixelRatio,1));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
document.getElementById('game').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xcce8ff,0x4b3829,1.6));
const sun=new THREE.DirectionalLight(0xffffff,2);
sun.position.set(80,150,60);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-90;sun.shadow.camera.right=90;sun.shadow.camera.top=90;sun.shadow.camera.bottom=-90;sun.shadow.camera.near=1;sun.shadow.camera.far=300;
scene.add(sun);

const ASSET_BASE='https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/26.3-snapshot-7/assets/minecraft/textures/block/';
const loader=new THREE.TextureLoader();
function tx(name,animated=false){const t=loader.load(ASSET_BASE+name+'.png',()=>{if(animated&&t.image?.height>t.image?.width){const frames=Math.max(1,Math.round(t.image.height/t.image.width));t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,1/frames);t.offset.y=0;t.needsUpdate=true}});t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;return t}
const textures={
  grassTop:tx('grass_block_top'),
  grassSide:tx('grass_block_side'),
  dirt:tx('dirt'),
  stone:tx('stone'),
  sand:tx('sand'),
  oak:tx('oak_log'),
  oakTop:tx('oak_log_top'),
  leaves:tx('oak_leaves'),
  water:tx('water_still',true)
};
function mat(map,extra={}){return new THREE.MeshLambertMaterial({map,...extra})}
const oreTextures={
  deepslate:tx('deepslate'),
  coal:tx('coal_ore'),
  iron:tx('iron_ore'),
  copper:tx('copper_ore'),
  gold:tx('gold_ore'),
  redstone:tx('redstone_ore'),
  diamond:tx('diamond_ore'),
  emerald:tx('emerald_ore'),
  bedrock:tx('bedrock'),
  deepslateCoal:tx('deepslate_coal_ore'),
  deepslateIron:tx('deepslate_iron_ore'),
  deepslateCopper:tx('deepslate_copper_ore'),
  deepslateGold:tx('deepslate_gold_ore'),
  deepslateRedstone:tx('deepslate_redstone_ore'),
  deepslateDiamond:tx('deepslate_diamond_ore'),
  deepslateEmerald:tx('deepslate_emerald_ore')
};
const materials={
  grass:[mat(textures.grassSide),mat(textures.grassSide),mat(textures.grassTop,{color:0x91bd59}),mat(textures.dirt),mat(textures.grassSide),mat(textures.grassSide)],
  dirt:mat(textures.dirt),stone:mat(textures.stone),sand:mat(textures.sand),
  wood:[mat(textures.oak),mat(textures.oak),mat(textures.oakTop),mat(textures.oakTop),mat(textures.oak),mat(textures.oak)],
  leaves:mat(textures.leaves,{transparent:true,alphaTest:.1,color:0x77ab3a}),
  water:mat(textures.water,{transparent:true,opacity:.62,depthWrite:false,depthTest:true,color:0x3f76e4,side:THREE.DoubleSide}),
  deepslate:mat(oreTextures.deepslate),coal:mat(oreTextures.coal),iron:mat(oreTextures.iron),copper:mat(oreTextures.copper),
  gold:mat(oreTextures.gold),redstone:mat(oreTextures.redstone),diamond:mat(oreTextures.diamond),emerald:mat(oreTextures.emerald),
  deepslateCoal:mat(oreTextures.deepslateCoal),deepslateIron:mat(oreTextures.deepslateIron),deepslateCopper:mat(oreTextures.deepslateCopper),deepslateGold:mat(oreTextures.deepslateGold),deepslateRedstone:mat(oreTextures.deepslateRedstone),deepslateDiamond:mat(oreTextures.deepslateDiamond),deepslateEmerald:mat(oreTextures.deepslateEmerald)
};

const B={AIR:0,GRASS:1,DIRT:2,STONE:3,SAND:4,WOOD:5,LEAVES:6,WATER:7,DEEPSLATE:8,COAL:9,IRON:10,COPPER:11,GOLD:12,REDSTONE:13,DIAMOND:14,EMERALD:15,DEEPSLATE_COAL:16,DEEPSLATE_IRON:17,DEEPSLATE_COPPER:18,DEEPSLATE_GOLD:19,DEEPSLATE_REDSTONE:20,DEEPSLATE_DIAMOND:21,DEEPSLATE_EMERALD:22,BEDROCK:23};
const hotbarTypes=[B.GRASS,B.DIRT,B.STONE,B.SAND,B.WOOD,B.LEAVES,B.DEEPSLATE,B.STONE,B.BEDROCK];
let placeRotation=0;
const chunks=new Map(),geometry=new THREE.BoxGeometry(1,1,1),temp=new THREE.Object3D(),broken=new Set(),placed=new Map(),drops=[];
const keys={};
const player={position:new THREE.Vector3(0,45,0),velocity:new THREE.Vector3(),height:1.8,width:.6,onGround:false};
let yaw=0,pitch=0,locked=false,gameStarted=false,frameCount=0,fpsTime=performance.now(),chunkTimer=0,selectedSlot=0,cps=0,clickTimes=[],inventoryOpen=false;

const clock=new THREE.Clock();

function hash2D(x,z){
  let h=Math.imul(x,374761393);
  h=Math.imul(h^(h>>>13),1274126177);
  let h2=Math.imul(z,668265263);
  h2=Math.imul(h2^(h2>>>15),2246822519);
  h^=h2;h^=seed;
  h=Math.imul(h^(h>>>16),0x45d9f3b);
  h^=h>>>16;
  return(h>>>0)/4294967295;
}
function smooth(t){return t*t*(3-2*t)}
function noise2D(x,z,scale=1){
  x/=scale;z/=scale;
  const x0=Math.floor(x),z0=Math.floor(z),x1=x0+1,z1=z0+1,sx=smooth(x-x0),sz=smooth(z-z0);
  const n00=hash2D(x0,z0),n10=hash2D(x1,z0),n01=hash2D(x0,z1),n11=hash2D(x1,z1);
  const nx0=n00+(n10-n00)*sx,nx1=n01+(n11-n01)*sx;
  return nx0+(nx1-nx0)*sz;
}
function fbm(x,z){
  let value=0,amp=1,freq=1,total=0;
  for(let i=0;i<2;i++){
    value+=noise2D(x*freq,z*freq,100/freq)*amp;
    total+=amp;amp*=.5;freq*=2;
  }
  return value/total;
}
function getHeight(x,z){
  const continental=fbm(x,z),hills=noise2D(x,z,42);
  let h=16+continental*18+hills*6;
  return Math.max(4,Math.min(WORLD_HEIGHT-5,Math.floor(h)));
}
function oreNoise(x,y,z){return hash2D(x*31+y*17,z*47+y*13)}
function getBlock(x,y,z){
  if(y<0||y>=WORLD_HEIGHT)return B.AIR;
  const wk=[Math.floor(x),Math.floor(y),Math.floor(z)].join(',');
  if(placed.has(wk))return placed.get(wk).type;
  if(broken.has(wk))return B.AIR;
  if(y===0)return B.BEDROCK;
  const h=getHeight(x,z);
  if(y>h)return y<=WATER_LEVEL?B.WATER:B.AIR;
  if(y===h)return h<=WATER_LEVEL+1?B.SAND:B.GRASS;
  if(y>h-4)return h<=WATER_LEVEL+1?B.SAND:B.DIRT;
  const n=oreNoise(x,y,z);
  const deep=y<9;
  if(y<=30&&n>.975)return deep?B.DEEPSLATE_COAL:B.COAL;
  if(y<=28&&n>.985)return deep?B.DEEPSLATE_IRON:B.IRON;
  if(y<=30&&n>.991)return deep?B.DEEPSLATE_COPPER:B.COPPER;
  if(y<=20&&n>.995)return deep?B.DEEPSLATE_GOLD:B.GOLD;
  if(y<=16&&n>.997)return deep?B.DEEPSLATE_REDSTONE:B.REDSTONE;
  if(y<=16&&n>.9985)return deep?B.DEEPSLATE_DIAMOND:B.DIAMOND;
  if(y<=30&&n>.9992&&Math.abs(x+z)%7===0)return deep?B.DEEPSLATE_EMERALD:B.EMERALD;
  return deep?B.DEEPSLATE:B.STONE;
}
function isTree(x,z){
  const h=getHeight(x,z);
  if(h<=WATER_LEVEL+1)return false;
  if(hash2D(x*13+71,z*17-19)<.997)return false;
  return noise2D(x+900,z-900,8)>.4;
}
function treeBlocks(x,z){
  const h=getHeight(x,z),out=[],trunkHeight=4+Math.floor(hash2D(x,z)*3);
  for(let y=1;y<=trunkHeight;y++)out.push({x,y:h+y,z,type:B.WOOD});
  const top=h+trunkHeight;
  for(let yy=-2;yy<=2;yy++)for(let xx=-2;xx<=2;xx++)for(let zz=-2;zz<=2;zz++){
    if(Math.abs(xx)+Math.abs(zz)+Math.abs(yy)*.8<3.2)out.push({x:x+xx,y:top+yy,z:z+zz,type:B.LEAVES});
  }
  return out;
}
function key(cx,cz){return `${cx},${cz}`}
function material(type){
  return type===B.GRASS?materials.grass:type===B.DIRT?materials.dirt:type===B.STONE?materials.stone:
    type===B.SAND?materials.sand:type===B.WOOD?materials.wood:type===B.LEAVES?materials.leaves:type===B.WATER?materials.water:type===B.BEDROCK?materials.bedrock:type===B.DEEPSLATE?materials.deepslate:type===B.COAL?materials.coal:type===B.IRON?materials.iron:type===B.COPPER?materials.copper:type===B.GOLD?materials.gold:type===B.REDSTONE?materials.redstone:type===B.DIAMOND?materials.diamond:type===B.EMERALD?materials.emerald:type===B.DEEPSLATE_COAL?materials.deepslateCoal:type===B.DEEPSLATE_IRON?materials.deepslateIron:type===B.DEEPSLATE_COPPER?materials.deepslateCopper:type===B.DEEPSLATE_GOLD?materials.deepslateGold:type===B.DEEPSLATE_REDSTONE?materials.deepslateRedstone:type===B.DEEPSLATE_DIAMOND?materials.deepslateDiamond:materials.deepslateEmerald;
}
function createChunk(cx,cz){
  const k=key(cx,cz);if(chunks.has(k))return;
  const blocks=[],sx=cx*CHUNK_SIZE,sz=cz*CHUNK_SIZE;
  for(let x=0;x<CHUNK_SIZE;x++)for(let z=0;z<CHUNK_SIZE;z++){
    const wx=sx+x,wz=sz+z,h=getHeight(wx,wz);
    const bottom=mobile?Math.max(0,h-5):0;
    for(let y=bottom;y<=h;y++){const type=getBlock(wx,y,wz);if(type!==B.AIR&&!broken.has(`${wx},${y},${wz}`))blocks.push({x:wx,y,z:wz,type})}
    if(!mobile&&isTree(wx,wz))for(const tb of treeBlocks(wx,wz))if(!broken.has([tb.x,tb.y,tb.z].join(','))&&!placed.has([tb.x,tb.y,tb.z].join(',')))blocks.push(tb);
    if(h<WATER_LEVEL)blocks.push({x:wx,y:WATER_LEVEL,z:wz,type:B.WATER});
  }
  for(const [pk,pb] of placed){const q=pk.split(',').map(Number);if(Math.floor(q[0]/CHUNK_SIZE)===cx&&Math.floor(q[2]/CHUNK_SIZE)===cz&&q[1]>getHeight(q[0],q[2])&&q[1]<WORLD_HEIGHT)blocks.push({x:q[0],y:q[1],z:q[2],type:pb.type,rot:pb.rot||0})}
  const groups=new Map();
  for(const block of blocks){
    const n=[[block.x+1,block.y,block.z],[block.x-1,block.y,block.z],[block.x,block.y+1,block.z],[block.x,block.y-1,block.z],[block.x,block.y,block.z+1],[block.x,block.y,block.z-1]];
    let visible=false;
    for(const [nx,ny,nz] of n){const nb=broken.has(`${nx},${ny},${nz}`)?B.AIR:getBlock(nx,ny,nz);if(nb===B.AIR||nb===B.WATER||(block.type===B.WATER&&nb!==B.WATER)){visible=true;break}}
    if(!visible)continue;
    if(!groups.has(block.type))groups.set(block.type,[]);
    groups.get(block.type).push(block);
  }
  const meshes=[];
  for(const [type,list] of groups){
    const mesh=new THREE.InstancedMesh(geometry,material(type),list.length);
    mesh.frustumCulled=false;
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    for(let i=0;i<list.length;i++){
      const b=list[i];temp.position.set(b.x+.5,b.y+.5,b.z+.5);temp.rotation.set(0,b.rot||0,0);temp.scale.set(1,1,1);temp.updateMatrix();mesh.setMatrixAt(i,temp.matrix);
    }
    mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=false;mesh.receiveShadow=true;if(list.some(b=>b.type===B.WATER)){mesh.renderOrder=2;const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];for(const m of mats){m.transparent=true;m.depthWrite=false;m.opacity=.62}}scene.add(mesh);meshes.push(mesh);
  }
  chunks.set(k,{cx,cz,meshes});
}
function unloadChunk(cx,cz){
  const c=chunks.get(key(cx,cz));if(!c)return;
  for(const mesh of c.meshes){scene.remove(mesh);mesh.dispose()}
  chunks.delete(key(cx,cz));
}
function updateChunks(){
  const pcx=Math.floor(player.position.x/CHUNK_SIZE),pcz=Math.floor(player.position.z/CHUNK_SIZE),wanted=new Set();
  for(let x=-RENDER_DISTANCE;x<=RENDER_DISTANCE;x++)for(let z=-RENDER_DISTANCE;z<=RENDER_DISTANCE;z++){
    if(Math.max(Math.abs(x),Math.abs(z))>RENDER_DISTANCE)continue;
    const cx=pcx+x,cz=pcz+z,k=key(cx,cz);wanted.add(k);if(!chunks.has(k))createChunk(cx,cz);
  }
  for(const [k,c] of chunks)if(!wanted.has(k))unloadChunk(c.cx,c.cz);
  
}
function solid(x,y,z){
  const b=broken.has(`${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`)?B.AIR:getBlock(Math.floor(x),Math.floor(y),Math.floor(z));
  return b!==B.AIR&&b!==B.WATER;
}
function collides(p){
  const half=player.width/2,minX=Math.floor(p.x-half),maxX=Math.floor(p.x+half),minY=Math.floor(p.y),maxY=Math.floor(p.y+player.height),minZ=Math.floor(p.z-half),maxZ=Math.floor(p.z+half);
  for(let x=minX;x<=maxX;x++)for(let y=minY;y<=maxY;y++)for(let z=minZ;z<=maxZ;z++)if(solid(x,y,z))return true;
  return false;
}
function move(dt){
  const speed=keys.ShiftLeft?7:4,d=new THREE.Vector3();
  if(keys.KeyW)d.z-=1;if(keys.KeyS)d.z+=1;if(keys.KeyA)d.x-=1;if(keys.KeyD)d.x+=1;
  if(d.lengthSq()){d.normalize();const sin=Math.sin(yaw),cos=Math.cos(yaw),x=d.x*cos+d.z*sin,z=-d.x*sin+d.z*cos;player.velocity.x=x*speed;player.velocity.z=z*speed}
  else{player.velocity.x*=.75;player.velocity.z*=.75}
  player.velocity.y-=25*dt;
  if(keys.Space&&player.onGround){player.velocity.y=8;player.onGround=false}
  const old=player.position.clone();
  player.position.x+=player.velocity.x*dt;if(collides(player.position)){player.position.x=old.x;player.velocity.x=0}
  player.position.z+=player.velocity.z*dt;if(collides(player.position)){player.position.z=old.z;player.velocity.z=0}
  player.position.y+=player.velocity.y*dt;
  if(collides(player.position)){player.position.y=old.y;if(player.velocity.y<0)player.onGround=true;player.velocity.y=0}else player.onGround=false;
  if(player.position.y<-30){player.position.set(0,getHeight(0,0)+3,0);player.velocity.set(0,0,0)}
}
function cameraUpdate(){camera.position.set(player.position.x,player.position.y+1.62,player.position.z);camera.rotation.y=yaw;camera.rotation.x=pitch}
let breaking=false,breakTarget=null,breakStart=0,breakDuration=0,breakStage=-1;
const destroyTextures=Array.from({length:10},(_,i)=>loader.load(`https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/26.3-snapshot-7/assets/minecraft/textures/block/destroy_stage_${i}.png`));
for(const t of destroyTextures){t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace}
const breakMesh=new THREE.Mesh(geometry,Array.from({length:6},()=>new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,opacity:.95})));
breakMesh.scale.setScalar(1.003);breakMesh.visible=false;scene.add(breakMesh);
function rayBlock(){
  const origin=camera.position.clone(),dir=new THREE.Vector3();camera.getWorldDirection(dir);let last=null;
  for(let d=0;d<=6;d+=.04){const p=origin.clone().addScaledVector(dir,d),x=Math.floor(p.x),y=Math.floor(p.y),z=Math.floor(p.z),type=getBlock(x,y,z);if(type!==B.AIR&&type!==B.WATER){const normal=new THREE.Vector3(last?last.x-x:0,last?last.y-y:1,last?last.z-z:0);return{x,y,z,type,normal}}last={x,y,z}}
  return null;
}
function hardness(type){if(type===B.BEDROCK)return Infinity;return type===B.LEAVES?.18:type===B.GRASS||type===B.DIRT||type===B.SAND?.55:type===B.WOOD?1.05:type===B.STONE?1.5:.8}
function setBreakStage(stage,target){
  if(stage<0||!target){breakMesh.visible=false;return}
  breakMesh.position.set(target.x+.5,target.y+.5,target.z+.5);
  for(const mat of breakMesh.material)mat.map=destroyTextures[stage];
  for(const mat of breakMesh.material)mat.needsUpdate=true;
  breakMesh.visible=true;
}
function startBreaking(){
  if(!gameStarted||mobile)return;
  const t=rayBlock();if(!t||t.type===B.BEDROCK)return;
  breaking=true;breakTarget=t;breakStart=performance.now();breakDuration=hardness(t.type)*1000;breakStage=0;setBreakStage(0,t);
}
function stopBreaking(){breaking=false;breakTarget=null;breakStage=-1;breakMesh.visible=false}
function spawnDrop(type,x,y,z){
  const m=new THREE.Mesh(geometry,material(type));m.scale.setScalar(.28);m.position.set(x+.5,y+.5,z+.5);m.rotation.set(Math.random(),Math.random(),Math.random());scene.add(m);
  drops.push({mesh:m,velocity:new THREE.Vector3((Math.random()-.5)*2,3+Math.random()*2,(Math.random()-.5)*2),age:0});
}
function finishBreaking(t){
  const k=[t.x,t.y,t.z].join(',');
  if(placed.has(k))placed.delete(k);else broken.add(k);
  spawnDrop(t.type,t.x,t.y,t.z);
  const cx=Math.floor(t.x/CHUNK_SIZE),cz=Math.floor(t.z/CHUNK_SIZE);
  unloadChunk(cx,cz);createChunk(cx,cz);stopBreaking();
}
function placeBlock(){
  if(!gameStarted||inventoryOpen||mobile)return;
  const hit=rayBlock();if(!hit)return;
  const nx=hit.x+Math.round(hit.normal.x),ny=hit.y+Math.round(hit.normal.y),nz=hit.z+Math.round(hit.normal.z);
  if(ny<1||ny>=WORLD_HEIGHT)return;
  const k=[nx,ny,nz].join(',');
  if(getBlock(nx,ny,nz)!==B.AIR)return;
  const type=hotbarTypes[selectedSlot];if(type===B.BEDROCK)return;
  const minX=Math.floor(player.position.x-player.width/2),maxX=Math.floor(player.position.x+player.width/2),minY=Math.floor(player.position.y),maxY=Math.floor(player.position.y+player.height),minZ=Math.floor(player.position.z-player.width/2),maxZ=Math.floor(player.position.z+player.width/2);
  if(nx>=minX&&nx<=maxX&&ny>=minY&&ny<=maxY&&nz>=minZ&&nz<=maxZ)return;
  placed.set(k,{type,rot:placeRotation});broken.delete(k);
  const cx=Math.floor(nx/CHUNK_SIZE),cz=Math.floor(nz/CHUNK_SIZE);unloadChunk(cx,cz);createChunk(cx,cz);
}

document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('mousedown',e=>{if(e.button===0)startBreaking();if(e.button===2)placeBlock()});
document.addEventListener('mouseup',e=>{if(e.button===0)stopBreaking()});

function updateKeysHud(){for(const code of ['KeyW','KeyA','KeyS','KeyD','Space']){const el=document.querySelector(`[data-key="${code}"]`);if(el)el.classList.toggle('pressed',!!keys[code])}}
function updateHotbar(){document.querySelectorAll('.hotbar-slot').forEach((el,i)=>el.classList.toggle('selected',i===selectedSlot));const h=document.querySelector('#survival-hud .hotbar');if(h)h.style.setProperty('--selected-slot',selectedSlot)}

function hud(){
  const now=performance.now();
  frameCount++;
  if(now-fpsTime>=500){
    const el=document.getElementById('fps');
    if(el)el.textContent='FPS '+Math.round(frameCount/((now-fpsTime)/1000));
    frameCount=0;
    fpsTime=now;
  }
  clickTimes=clickTimes.filter(t=>now-t<1000);
  cps=clickTimes.length;
  const cp=document.getElementById('cps');
  if(cp)cp.textContent='CPS '+cps;
  updateHotbar();
}
function initial(){
  const startX=0,startZ=0;
  player.position.set(startX+.5,getHeight(startX,startZ)+1.05,startZ+.5);
  cameraUpdate();
  updateChunks();
  const l=document.getElementById('loading');
  const p=document.getElementById('progress');
  if(p)p.style.width='100%';
  setTimeout(()=>{
    if(!l)return;
    l.style.opacity='0';
    setTimeout(()=>{
      l.style.display='none';
      const st=document.getElementById('start');
      if(st)st.style.display='flex';
    },250);
  },250);
}

renderer.domElement.addEventListener('click',()=>{if(!mobile&&!locked)renderer.domElement.requestPointerLock()});
document.addEventListener('pointerlockchange',()=>locked=document.pointerLockElement===renderer.domElement);
document.addEventListener('mousemove',e=>{if(!locked||!gameStarted)return;yaw-=e.movementX*.002;pitch-=e.movementY*.002;pitch=Math.max(-Math.PI/2+.01,Math.min(Math.PI/2-.01,pitch))});
document.addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyR'&&gameStarted&&!inventoryOpen)placeRotation=(placeRotation+Math.PI/2)%(Math.PI*2);if(/^Digit[1-9]$/.test(e.code)){selectedSlot=Number(e.code.slice(5))-1;updateHotbar()}if(e.code==='KeyE'&&gameStarted){inventoryOpen=!inventoryOpen;document.getElementById('inventory').classList.toggle('open',inventoryOpen);if(inventoryOpen&&locked)document.exitPointerLock()}if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault()});
document.addEventListener('keyup',e=>keys[e.code]=false);
document.addEventListener('wheel',e=>{if(!gameStarted||inventoryOpen)return;selectedSlot=(selectedSlot+(e.deltaY>0?1:8))%9;updateHotbar()},{passive:true});
document.addEventListener('mousedown',e=>{if(e.button===0){const now=performance.now();clickTimes.push(now);clickTimes=clickTimes.filter(t=>now-t<1000);cps=clickTimes.length}});
document.getElementById('play').addEventListener('click',()=>{gameStarted=true;document.getElementById('start').style.display='none';if(!mobile)renderer.domElement.requestPointerLock()});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.05);
  if(gameStarted&&!inventoryOpen)move(dt);for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.age+=dt;d.velocity.y-=14*dt;d.mesh.position.addScaledVector(d.velocity,dt);d.mesh.rotation.x+=dt*2;d.mesh.rotation.y+=dt*3;const gy=getHeight(Math.floor(d.mesh.position.x),Math.floor(d.mesh.position.z))+.25;if(d.mesh.position.y<gy){d.mesh.position.y=gy;d.velocity.y*=-.35;d.velocity.x*=.8;d.velocity.z*=.8}const dx=player.position.x-d.mesh.position.x,dy=player.position.y+.7-d.mesh.position.y,dz=player.position.z-d.mesh.position.z,dist=Math.hypot(dx,dy,dz);if(dist<2.2){const f=Math.min(8,3+5/(dist+.25));d.velocity.x+=dx*f*dt;d.velocity.y+=dy*f*dt;d.velocity.z+=dz*f*dt}if(d.age>20||dist<.45){scene.remove(d.mesh);drops.splice(i,1)}}if(breaking){const t=rayBlock();if(!t||t.x!==breakTarget.x||t.y!==breakTarget.y||t.z!==breakTarget.z)stopBreaking();else{const p=(performance.now()-breakStart)/breakDuration,stage=Math.min(9,Math.floor(p*10));if(stage!==breakStage){breakStage=stage;setBreakStage(stage,breakTarget)}if(p>=1)finishBreaking(t)}}
  cameraUpdate();hud();chunkTimer+=dt;
  if(chunkTimer>.35){updateChunks();chunkTimer=0}
  renderer.render(scene,camera);
}
initial();animate();
setTimeout(()=>{const l=document.getElementById('loading');if(l&&l.style.display!=='none'){document.querySelector('.loading-text').textContent='WORLD READY - TAP TO CONTINUE';l.style.opacity='0';setTimeout(()=>{l.style.display='none';document.getElementById('start').style.display='flex'},250)}},10000);
if(mobile){
  document.getElementById('mobile').style.display='block';
  const stick=document.getElementById('stick'),knob=document.getElementById('stick-knob');
  let stickId=null,sx=0,sy=0;
  function stickMove(t){
    let dx=t.clientX-sx,dy=t.clientY-sy,len=Math.hypot(dx,dy),max=42;
    if(len>max){dx=dx/len*max;dy=dy/len*max}
    knob.style.transform=`translate(${dx}px,${dy}px)`;
    keys.KeyW=dy<-10;keys.KeyS=dy>10;keys.KeyA=dx<-10;keys.KeyD=dx>10;
  }
  stick.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];stickId=t.identifier;sx=t.clientX;sy=t.clientY;stickMove(t)},{passive:false});
  stick.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===stickId)stickMove(t)},{passive:false});
  stick.addEventListener('touchend',e=>{e.preventDefault();knob.style.transform='translate(0,0)';keys.KeyW=keys.KeyS=keys.KeyA=keys.KeyD=false},{passive:false});
  for(const b of document.querySelectorAll('#mobile-buttons button')){
    b.addEventListener('touchstart',e=>{e.preventDefault();keys[b.dataset.key]=true},{passive:false});
    b.addEventListener('touchend',e=>{e.preventDefault();keys[b.dataset.key]=false},{passive:false});
  }
  let lookId=null,lx=0,ly=0;
  renderer.domElement.addEventListener('touchstart',e=>{if(e.target.closest('#mobile'))return;const t=e.changedTouches[0];lookId=t.identifier;lx=t.clientX;ly=t.clientY},{passive:true});
  renderer.domElement.addEventListener('touchmove',e=>{for(const t of e.changedTouches)if(t.identifier===lookId){yaw-=(t.clientX-lx)*.006;pitch-=(t.clientY-ly)*.006;pitch=Math.max(-1.5,Math.min(1.5,pitch));lx=t.clientX;ly=t.clientY}},{passive:true});
  renderer.domElement.addEventListener('touchend',e=>{for(const t of e.changedTouches)if(t.identifier===lookId)lookId=null},{passive:true});
  document.getElementById('play').addEventListener('touchend',e=>{e.preventDefault();gameStarted=true;document.getElementById('start').style.display='none'},{passive:false});
}

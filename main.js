import * as THREE from 'three';

const CHUNK_SIZE=16,WORLD_HEIGHT=64,RENDER_DISTANCE=2,WATER_LEVEL=20,seed=928374;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x78a9d5);
scene.fog=new THREE.Fog(0x78a9d5,70,190);

const camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.05,300);
camera.rotation.order='YXZ';

const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
document.getElementById('game').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xcce8ff,0x4b3829,1.6));
const sun=new THREE.DirectionalLight(0xffffff,2);
sun.position.set(80,150,60);
scene.add(sun);

const TEX={"grassTop":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAA8UlEQVR42gUAWW+CMPj7yXuZ0ylHOWwpR6EFC0ERh8gh+ELGEl9mwh8zEC9iv2eaVxwodpoPHxKvlJmeGVp3E4uHXah8xXJIGMbndsRf+gwrm8ooU7hm+pK5jQI/5mgODzI8P/XmrhIfsnR9Q4ckxwkx1ySIQT3WITepZuHfIWokA4ZPbri7WnLEiJVaB00+9wMaj1NvcFsUKkjjz/fSXscR74KJIcgLWRtzIF6bxmREMrDGfSUt7kjubSdNofCUiGaR/U0jqpzrjQTUrriSoeUi2rwk7QOqy2s73WOhJgnuTu4G7ANxrmksgv9dZ4WkeAPz+JNw8txdwAAAAABJRU5ErkJggg==","grassSide":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAeFBMVEV5VTqWbEq5hVyHh4dwsEZoqD5iojhsrEJhoTdpqT9npz1goDZXly1QkCZzs0l2tkyKuVp+vlRqqkCDslOBsFFmpjyQv2CSwWKTwmN/v1WXxmdvr0VkpDqcy2xrq0GNvF11tUttrUN0tEpfnzVxsUd0WERsbGxZPSmGrpghAAAAjElEQVR42gXBB0LCAAAEwd2LGkAFG3ZqIPf/HzLDebPebv+m8XXztlounk8cx5eP994/TN+f68W42nPo7n/Zu55/vn779Fg6t5e2U0+lBTEV2s5YoIptoUAIMEBCgggkClZBEUSKAgUstAAkCJIQm1QHEDQ4K5VCRQMAJCBcUZoSRRpKEwRFogwoKL0BxA0LD3lN79UAAAAASUVORK5CYII=","dirt":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAFVBMVEV5VTq5hVyHh4eWbEpsbGx0WERZPSk6VlZqAAAAa0lEQVR42gXBwQnDQAxFwSd+0FnLgs8+5SyjsA2kgZQgY9j+S8gMM61oM9R6W85NeBDs4BPLSpbk9bBeary02zGC02JIMIpVFCm5kkbtDUPIYt5HnaQuffNxPCuAgfiVH1bk7T5EkTPPovwPGbIOYwnMHcMAAAAASUVORK5CYII=","stone":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAAXklEQVR42gXBMQEAMAwEocqNgNuR8JYLb9uUruCRgLv0dFddBR6bsaF6Ucm2xTNAXddebGur4NVdV1R424xtoMewjW3zTuouUT2wgc2eyhR3XW9TVFR7CsC2PaBsxAdyLn2NNWHIVAAAAABJRU5ErkJggg==","sand":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEXaz6Pt68vn5Lvj27DVxJbRuoo9qeK3AAAAZUlEQVR42gXBMQrCQABE0U9m0gtiH28wkNiP2bUXzP3P4ntscjI0qD2u7bGQ6wS76PCxD0NvQ6LC7OlBOf3u/NqY2nMxjT6jKVuZqzlYZZFLTNJ9tnQMPzNF8pJEke5JfpDsMskfw+0REW3/INgAAAAASUVORK5CYII=","oak":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEV0WjaYeEmRcUJfSitMPSY4Kxi/mP6UAAAAaElEQVR42gXBwQ3DIBREwSd2/90SKWAl8B0lDRAqcPpvJjM4lWpHuFevtkV9qttb3LJUezBV6nLInu7TYe2xEof15M1Q8I+3xgh8WZp5oKnkPLiprro2L8bdi8W142Egh9s+kLOnOfoDKZ4L2kN8RTwAAAAASUVORK5CYII=","oakTop":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAG1BMVEVfSivCnWK4lF+vj1WfhE2WdEF+Yjd0WjZMPSZxHR9aAAAAbklEQVR42gXBgXHDQAwDMFD21dp/3CZ+BmA9lmdZZP+R5oziL+ZWTRHf3vgIUq70liYg2phtmUlmiI1rjuvFHPOeoVWJamMAIoRZoEeFjWvejLTa6XtTDiA1W6pte7AxkwbgPTFE44xyWCzPsg8/vNE4rPRQOg0AAAAASUVORK5CYII=","leaves":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAD1BMVEUAAAC5vLmYmZh3dXdoZGjJX6haAAAAAXRSTlMAQObYZgAAAGlJREFUeNoFgAERwyAMAD8pAtJ0AgIYaAEBbI1/TTtSNOaPiyCHDqkwtVvIia7tHzB6p1IatFtW8gazuB93e1j7tBwy8PJtR4+OkW+0cDR2exThSqQeASMalo9QZe2iV8XcmbgRp5W8Rf/WMg1MmmHulQAAAABJRU5ErkJggg==","water":"iVBORw0KGgoAAAANSUhEUgAAABAAAAIABAMAAAB5lPHgAAAAJ1BMVEWlpaX////5+fnY2NjW1tbV1dXT09PS0tLPz8/Ozs7CwsK4uLiurq5q5mAmAAAADXRSTlO0tLS0tLS0tLS0tLS0frXQ3wAABURJREFUeNqN2D9uG0cUBvDvAK8hkEjRxifIAXKEHME9U1DJeBs2EkCoUREHcGfAdgxVZrMEnl5tA4aKcSMDk+9Q0fzbHXJJO9MMZojB/PD43uzOwgghd38BIInYAaAa4BGMSgL0EAgBT6N5wBjbZYc/ehpJxcKtXQj2iNwESGsCiTo1dR5CqvdpHBavPAJ//4VG4iF5hrczD2ceAyDG2LF6/owenzw8ASJl7QvJw5vEkdx2WD3xInjN34Rj60SNZ0Hgw8zB71sUTjAZHiDH8CAGzVyigJQ+PeZg8oPFTh62xT57NiyePFo9I8uC0B6SyeHZPHh543kIQ5h6OHsw8yl3jcauLnsNm9DD1+x4BZO7hkDyXm9GjDG8mDykQrR4mj289vvHsogfioEP0dPfFw+IR+slDEUlDyx5pPYPTPhicR9AUH9HW00ePtJ7wkD2+euL/NYweXdgTMCDRGYoHpzwyee6TR3VoPG8aj2f1gJI8kjx9SiKP1qMMvW88Wj2hGGTfw8ZT8+ff4tndTJ73kycwem4Iqwnpj3g8Nda7MbjkMT03bjsFv+Fh67HqCckTdNsp4bwPLyx6OOSlatHzLGSPVI9QiweNh6MnuKMenvAwzDzL4nlcmf4E4ar1dHseZA9aT+AyebR4lNxNnmE0TIehth7yqKd/8tybXgDVM0SPm1lIi8OH7AmcPEweGjl0+3AY43HCzn3aJc967sUHz6q6QLg1QfEtu0JeRE9fvL44qE1nstDT9isqmcHf8oj4DFPWLyKHo6eM0vJt9wQsjob0GdPgEfycO4pBSifi8dlD056lH7P4wGtnouXxTOYribPtvOQ1T8DbhoPk8ePHkbPblPmRYtHr2cefscjxcPR83UwvqZCjU/0XL0e0CVPUOCEZ3B53lcP9Rqafx9OeTj33GTP4rkSGj1OFRI6w+i5vp17/MyjICR7eqa5c6j/lud8vh9T188vxqhxi87Z8WD6jm//Yifj3lKQpJUqlVPqJ7r4rHQeGoLXlbGbJPJE+zAs9xYgOimehg9K7z7LJ/mDz8rudq8uQm+56lEqwenz084XEG1Ppa7LrWI5RDj40eKR6AYTV55o3RYwceGlk9TJ5t8Wj2bF31WPR8rh6beQaFQQiP6qErHvKoh2tXPbLnQfZ4BDae6Xx+fat450cPiqfmA0l1ub4k7Q/LHkX4lkeWzkpiHfH8Rg8jt5cpn614tHq65FEF4H3yCKTGp3q88P97IEvjac/z4lmpDY2HBF//3XrEp3UQoHpMHXcOIXmEMCU9Lz0JIZsk8fve6x4XmbPzlnrCSS4eGnYJI8FgGlB9pTD2twmns86eZQMxuyRI54IaT2h1PvkeRU9XgYlP0XPh+IRyOKOeMiVUt4PJUqyR+BJ5zjcTB6q0kcPs0eOAD50nhKvZPlEby+y/G5V4Zl9LB4KOG8IywpjAVRMznHR92GQ4eBtORRXRljMHkQH7/n+Tp51Fg8vY8cXXckjBKUYT15SBGeJY9QQvJwig+ZPMG56NkxgsWgetl6pHjkwPNIZqOIsnhCen6pXhYPLXlIyp6HnuSBR0aPJs/WRs86e3z2SPHEoUyeMHo4evRZvu+sNsmD6LloPF7ATX/gEUSPHz1UjZ5l9ihc9EzHcvWQe/HB6OHk+dhFz26jLnuEDD9BPMmasXT5/l7vp370GG08n1eN50rXfetB9RDtFP3kKdRw3cWdtp3a6Bnen/zeMvfk4qeO3zdAxUKXrvHkTeceQfbI6JGwuMseGvkfU1SgCRdOlMYAAAAASUVORK5CYII="};\nconst loader=new THREE.TextureLoader();\nfunction tx(b){const t=loader.load('data:image/png;base64,'+b);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;return t;}\nconst textures={grassTop:tx(TEX.grassTop),grassSide:tx(TEX.grassSide),dirt:tx(TEX.dirt),stone:tx(TEX.stone),sand:tx(TEX.sand),oak:tx(TEX.oak),oakTop:tx(TEX.oakTop),leaves:tx(TEX.leaves),water:tx(TEX.water)};\nfunction mat(map,extra={}){return new THREE.MeshLambertMaterial({map,...extra});}\n

const materials={
  grass:[mat(textures.grassSide),mat(textures.grassSide),mat(textures.grassTop),mat(textures.dirt),mat(textures.grassSide),mat(textures.grassSide)],
  dirt:mat(textures.dirt),stone:mat(textures.stone),sand:mat(textures.sand),
  wood:[mat(textures.oak),mat(textures.oak),mat(textures.oakTop),mat(textures.oakTop),mat(textures.oak),mat(textures.oak)],
  leaves:mat(textures.leaves,{transparent:true,alphaTest:.1}),
  water:mat(textures.water,{transparent:true,opacity:.72,depthWrite:false})
};

const B={AIR:0,GRASS:1,DIRT:2,STONE:3,SAND:4,WOOD:5,LEAVES:6,WATER:7};
const chunks=new Map(),geometry=new THREE.BoxGeometry(1,1,1),temp=new THREE.Object3D();
const keys={};
const player={position:new THREE.Vector3(0,45,0),velocity:new THREE.Vector3(),height:1.8,width:.6,onGround:false};
let yaw=0,pitch=0,locked=false,frameCount=0,fpsTime=performance.now(),chunkTimer=0;
const mobile=matchMedia('(pointer:coarse)').matches||innerWidth<800;
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
function getBlock(x,y,z){
  if(y<0||y>=WORLD_HEIGHT)return B.AIR;
  const h=getHeight(x,z);
  if(y>h)return y<=WATER_LEVEL?B.WATER:B.AIR;
  if(y===h)return h<=WATER_LEVEL+1?B.SAND:B.GRASS;
  if(y>h-4)return h<=WATER_LEVEL+1?B.SAND:B.DIRT;
  return B.STONE;
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
    type===B.SAND?materials.sand:type===B.WOOD?materials.wood:type===B.LEAVES?materials.leaves:materials.water;
}
function createChunk(cx,cz){
  const k=key(cx,cz);if(chunks.has(k))return;
  const blocks=[],sx=cx*CHUNK_SIZE,sz=cz*CHUNK_SIZE;
  for(let x=0;x<CHUNK_SIZE;x++)for(let z=0;z<CHUNK_SIZE;z++){
    const wx=sx+x,wz=sz+z,h=getHeight(wx,wz);
    for(let y=0;y<=h;y++){const type=getBlock(wx,y,wz);if(type!==B.AIR)blocks.push({x:wx,y,z:wz,type})}
    if(isTree(wx,wz))blocks.push(...treeBlocks(wx,wz));
    if(h<WATER_LEVEL)for(let y=h+1;y<=WATER_LEVEL;y++)blocks.push({x:wx,y,z:wz,type:B.WATER});
  }
  const groups=new Map();
  for(const block of blocks){
    const n=[[block.x+1,block.y,block.z],[block.x-1,block.y,block.z],[block.x,block.y+1,block.z],[block.x,block.y-1,block.z],[block.x,block.y,block.z+1],[block.x,block.y,block.z-1]];
    let visible=false;
    for(const [nx,ny,nz] of n){const nb=getBlock(nx,ny,nz);if(nb===B.AIR||nb===B.WATER){visible=true;break}}
    if(!visible)continue;
    if(!groups.has(block.type))groups.set(block.type,[]);
    groups.get(block.type).push(block);
  }
  const meshes=[];
  for(const [type,list] of groups){
    const mesh=new THREE.InstancedMesh(geometry,material(type),list.length);
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    for(let i=0;i<list.length;i++){
      const b=list[i];temp.position.set(b.x+.5,b.y+.5,b.z+.5);temp.rotation.set(0,0,0);temp.scale.set(1,1,1);temp.updateMatrix();mesh.setMatrixAt(i,temp.matrix);
    }
    mesh.instanceMatrix.needsUpdate=true;scene.add(mesh);meshes.push(mesh);
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
  document.getElementById('chunks').textContent=`CHUNKS: ${chunks.size}`;
}
function solid(x,y,z){
  const b=getBlock(Math.floor(x),Math.floor(y),Math.floor(z));
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
  if(d.lengthSq()){d.normalize();const sin=Math.sin(yaw),cos=Math.cos(yaw),x=d.x*cos-d.z*sin,z=d.x*sin+d.z*cos;player.velocity.x=x*speed;player.velocity.z=z*speed}
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
function hud(){
  document.getElementById('coords').textContent=`X: ${Math.floor(player.position.x)}  Y: ${Math.floor(player.position.y)}  Z: ${Math.floor(player.position.z)}`;
  frameCount++;const now=performance.now();
  if(now-fpsTime>=500){document.getElementById('fps').textContent=`FPS: ${Math.round(frameCount/((now-fpsTime)/1000))}`;frameCount=0;fpsTime=now}
}
function initial(){
  const total=(RENDER_DISTANCE*2+1)**2;
  let done=0;
  const jobs=[];
  for(let x=-RENDER_DISTANCE;x<=RENDER_DISTANCE;x++)for(let z=-RENDER_DISTANCE;z<=RENDER_DISTANCE;z++)jobs.push([x,z]);
  jobs.sort((a,b)=>(Math.abs(a[0])+Math.abs(a[1]))-(Math.abs(b[0])+Math.abs(b[1])));
  function step(){
    const end=Math.min(done+2,jobs.length);
    while(done<end){const [x,z]=jobs[done++];createChunk(x,z)}
    document.getElementById('progress').style.width=`${done/total*100}%`;
    if(done<total)requestAnimationFrame(step);
    else{
      player.position.set(.5,getHeight(0,0)+1,.5);cameraUpdate();
      setTimeout(()=>{const l=document.getElementById('loading');l.style.opacity='0';setTimeout(()=>{l.style.display='none';document.getElementById('start').style.display='flex'},350)},150);
    }
  }
  requestAnimationFrame(step);
}
renderer.domElement.addEventListener('click',()=>{if(!mobile&&!locked)renderer.domElement.requestPointerLock()});
document.addEventListener('pointerlockchange',()=>locked=document.pointerLockElement===renderer.domElement);
document.addEventListener('mousemove',e=>{if(!locked)return;yaw-=e.movementX*.002;pitch-=e.movementY*.002;pitch=Math.max(-Math.PI/2+.01,Math.min(Math.PI/2-.01,pitch))});
document.addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault()});
document.addEventListener('keyup',e=>keys[e.code]=false);
document.getElementById('play').addEventListener('click',()=>{document.getElementById('start').style.display='none';renderer.domElement.requestPointerLock()});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.05);
  if(locked||mobile)move(dt);
  cameraUpdate();hud();chunkTimer+=dt;
  if(chunkTimer>.35){updateChunks();chunkTimer=0}
  renderer.render(scene,camera);
}
initial();animate();\nif(mobile){
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
  document.getElementById('play').addEventListener('touchend',e=>{e.preventDefault();document.getElementById('start').style.display='none'},{passive:false});
}

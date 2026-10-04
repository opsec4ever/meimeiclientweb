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

const TEX={"grassTop":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAA8UlEQVR42gUAWW+CMPj7yXuZ0ylHOWwpR6EFC0ERh8gh+ELGEl9mwh8zEC9iv2eaVxwodpoPHxKvlJmeGVp3E4uHXah8xXJIGMbndsRf+gwrm8ooU7hm+pK5jQI/5mgODzI8P/XmrhIfsnR9Q4ckxwkx1ySIQT3WITepZuHfIWokA4ZPbri7WnLEiJVaB00+9wMaj1NvcFsUKkjjz/fSXscR74KJIcgLWRtzIF6bxmREMrDGfSUt7kjubSdNofCUiGaR/U0jqpzrjQTUrriSoeUi2rwk7QOqy2s73WOhJgnuTu4G7ANxrmksgv9dZ4WkeAPz+JNw8txdwAAAAABJRU5ErkJggg==","grassSide":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAeFBMVEV5VTqWbEq5hVyHh4dwsEZoqD5iojhsrEJhoTdpqT9npz1goDZXly1QkCZzs0l2tkyKuVp+vlRqqkCDslOBsFFmpjyQv2CSwWKTwmN/v1WXxmdvr0VkpDqcy2xrq0GNvF11tUttrUN0tEpfnzVxsUd0WERsbGxZPSmGrpghAAAAjElEQVR42gXBB0LCAAAEwd2LGkAFG3ZqIPf/HzLDebPebv+m8XXztlounk8cx5eP994/TN+f68W42nPo7n/Zu55/vn779Fg6t5e2U0+lBTEV2s5YoIptoUAIMEBCgggkClZBEUSKAgUstAAkCJIQm1QHEDQ4K5VCRQMAJCBcUZoSRRpKEwRFogwoKL0BxA0LD3lN79UAAAAASUVORK5CYII=","dirt":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAFVBMVEV5VTq5hVyHh4eWbEpsbGx0WERZPSk6VlZqAAAAa0lEQVR42gXBwQnDQAxFwSd+0FnLgs8+5SyjsA2kgZQgY9j+S8gMM61oM9R6W85NeBDs4BPLSpbk9bBeary02zGC02JIMIpVFCm5kkbtDUPIYt5HnaQuffNxPCuAgfiVH1bk7T5EkTPPovwPGbIOYwnMHcMAAAAASUVORK5CYII=","stone":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAAXklEQVR42gXBMQEAMAwEocqNgNuR8JYLb9uUruCRgLv0dFddBR6bsaF6Ucm2xTNAXddebGur4NVdV1R424xtoMewjW3zTuouUT2wgc2eyhR3XW9TVFR7CsC2PaBsxAdyLn2NNWHIVAAAAABJRU5ErkJggg==","sand":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEXaz6Pt68vn5Lvj27DVxJbRuoo9qeK3AAAAZUlEQVR42gXBMQrCQABE0U9m0gtiH28wkNiP2bUXzP3P4ntscjI0qD2u7bGQ6wS76PCxD0NvQ6LC7OlBOf3u/NqY2nMxjT6jKVuZqzlYZZFLTNJ9tnQMPzNF8pJEke5JfpDsMskfw+0REW3/INgAAAAASUVORK5CYII=","oak":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAElBMVEV0WjaYeEmRcUJfSitMPSY4Kxi/mP6UAAAAaElEQVR42gXBwQ3DIBREwSd2/90SKWAl8B0lDRAqcPpvJjM4lWpHuFevtkV9qttb3LJUezBV6nLInu7TYe2xEof15M1Q8I+3xgh8WZp5oKnkPLiprro2L8bdi8W142Egh9s+kLOnOfoDKZ4L2kN8RTwAAAAASUVORK5CYII=","oakTop":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAG1BMVEVfSivCnWK4lF+vj1WfhE2WdEF+Yjd0WjZMPSZxHR9aAAAAbklEQVR42gXBgXHDQAwDMFD21dp/3CZ+BmA9lmdZZP+R5oziL+ZWTRHf3vgIUq70liYg2phtmUlmiI1rjuvFHPOeoVWJamMAIoRZoEeFjWvejLTa6XtTDiA1W6pte7AxkwbgPTFE44xyWCzPsg8/vNE4rPRQOg0AAAAASUVORK5CYII=","leaves":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAD1BMVEUAAAC5vLmYmZh3dXdoZGjJX6haAAAAAXRSTlMAQObYZgAAAGlJREFUeNoFgAERwyAMAD8pAtJ0AgIYaAEBbI1/TTtSNOaPiyCHDqkwtVvIia7tHzB6p1IatFtW8gazuB93e1j7tBwy8PJtR4+OkW+0cDR2exThSqQeASMalo9QZe2iV8XcmbgRp5W8Rf/WMg1MmmHulQAAAABJRU5ErkJggg==","water":"iVBORw0KGgoAAAANSUhEUgAAABAAAAIABAMAAAB5lPHgAAAAJ1BMVEWlpaX////5+fnY2NjW1tbV1dXT09PS0tLPz8/Ozs7CwsK4uLiurq5q5mAmAAAADXRSTlO0tLS0tLS0tLS0tLS0frXQ3wAABURJREFUeNqN2D9uG0cUBvDvAK8hkEjRxifIAXKEHME9U1DJeBs2EkCoUREHcGfAdgxVZrMEnl5tA4aKcSMDk+9Q0fzbHXJJO9MMZojB/PD43uzOwgghd38BIInYAaAa4BGMSgL0EAgBT6N5wBjbZYc/ehpJxcKtXQj2iNwESGsCiTo1dR5CqvdpHBavPAJ//4VG4iF5hrczD2ceAyDG2LF6/owenzw8ASJl7QvJw5vEkdx2WD3xInjN34Rj60SNZ0Hgw8zB71sUTjAZHiDH8CAGzVyigJQ+PeZg8oPFTh62xT57NiyePFo9I8uC0B6SyeHZPHh543kIQ5h6OHsw8yl3jcauLnsNm9DD1+x4BZO7hkDyXm9GjDG8mDykQrR4mj289vvHsogfioEP0dPfFw+IR+slDEUlDyx5pPYPTPhicR9AUH9HW00ePtJ7wkD2+euL/NYweXdgTMCDRGYoHpzwyee6TR3VoPG8aj2f1gJI8kjx9SiKP1qMMvW88Wj2hGGTfw8ZT8+ff4tndTJ73kycwem4Iqwnpj3g8Nda7MbjkMT03bjsFv+Fh67HqCckTdNsp4bwPLyx6OOSlatHzLGSPVI9QiweNh6MnuKMenvAwzDzL4nlcmf4E4ar1dHseZA9aT+AyebR4lNxNnmE0TIehth7yqKd/8tybXgDVM0SPm1lIi8OH7AmcPEweGjl0+3AY43HCzn3aJc967sUHz6q6QLg1QfEtu0JeRE9fvL44qE1nstDT9isqmcHf8oj4DFPWLyKHo6eM0vJt9wQsjob0GdPgEfycO4pBSifi8dlD056lH7P4wGtnouXxTOYribPtvOQ1T8DbhoPk8ePHkbPblPmRYtHr2cefscjxcPR83UwvqZCjU/0XL0e0CVPUOCEZ3B53lcP9Rqafx9OeTj33GTP4rkSGj1OFRI6w+i5vp17/MyjICR7eqa5c6j/lud8vh9T188vxqhxi87Z8WD6jm//Yifj3lKQpJUqlVPqJ7r4rHQeGoLXlbGbJPJE+zAs9xYgOimehg9K7z7LJ/mDz8rudq8uQm+56lEqwenz084XEG1Ppa7LrWI5RDj40eKR6AYTV55o3RYwceGlk9TJ5t8Wj2bF31WPR8rh6beQaFQQiP6qErHvKoh2tXPbLnQfZ4BDae6Xx+fat450cPiqfmA0l1ub4k7Q/LHkX4lkeWzkpiHfH8Rg8jt5cpn614tHq65FEF4H3yCKTGp3q88P97IEvjac/z4lmpDY2HBF//3XrEp3UQoHpMHXcOIXmEMCU9Lz0JIZsk8fve6x4XmbPzlnrCSS4eGnYJI8FgGlB9pTD2twmns86eZQMxuyRI54IaT2h1PvkeRU9XgYlP0XPh+IRyOKOeMiVUt4PJUqyR+BJ5zjcTB6q0kcPs0eOAD50nhKvZPlEby+y/G5V4Zl9LB4KOG8IywpjAVRMznHR92GQ4eBtORRXRljMHkQH7/n+Tp51Fg8vY8cXXckjBKUYT15SBGeJY9QQvJwig+ZPMG56NkxgsWgetl6pHjkwPNIZqOIsnhCen6pXhYPLXlIyp6HnuSBR0aPJs/WRs86e3z2SPHEoUyeMHo4evRZvu+sNsmD6LloPF7ATX/gEUSPHz1UjZ5l9ihc9EzHcvWQe/HB6OHk+dhFz26jLnuEDD9BPMmasXT5/l7vp370GG08n1eN50rXfetB9RDtFP3kKdRw3cWdtp3a6Bnen/zeMvfk4qeO3zdAxUKXrvHkTeceQfbI6JGwuMseGvkfU1SgCRdOlMYAAAAASUVORK5CYII="};
const loader=new THREE.TextureLoader();
function tx(b){const t=loader.load('data:image/png;base64,'+b);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;return t;}
const textures={grassTop:tx(TEX.grassTop),grassSide:tx(TEX.grassSide),dirt:tx(TEX.dirt),stone:tx(TEX.stone),sand:tx(TEX.sand),oak:tx(TEX.oak),oakTop:tx(TEX.oakTop),leaves:tx(TEX.leaves),water:tx(TEX.water)};
function mat(map,extra={}){return new THREE.MeshLambertMaterial({map,...extra});}
function pixelOreTexture(base,accent,seed){
  const c=document.createElement('canvas');c.width=16;c.height=16;
  const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle=base;x.fillRect(0,0,16,16);
  let n=seed>>>0;
  const rnd=()=>{n=Math.imul(n^n>>>16,2246822519);n=Math.imul(n^n>>>13,3266489917);return (n>>>0)/4294967295};
  for(let i=0;i<42;i++){const v=Math.floor(rnd()*24);x.fillStyle=v<4?'#1b1b1d':v<9?'#55575a':base;x.fillRect(Math.floor(rnd()*16),Math.floor(rnd()*16),1+(rnd()>.8?1:0),1);}
  for(let i=0;i<7;i++){x.fillStyle=accent;const px=2+Math.floor(rnd()*12),py=2+Math.floor(rnd()*12);x.fillRect(px,py,1,1);if(rnd()>.35)x.fillRect(px+1,py,1,1);if(rnd()>.55)x.fillRect(px,py+1,1,1);}
  const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;return t;
}
const oreTextures={
  deepslate:pixelOreTexture('#484a4f','#686a70',11),
  coal:pixelOreTexture('#777777','#171717',21),
  iron:pixelOreTexture('#777777','#d39b7b',31),
  copper:pixelOreTexture('#777777','#c86f4b',41),
  gold:pixelOreTexture('#777777','#f4c84b',51),
  redstone:pixelOreTexture('#777777','#c83232',61),
  diamond:pixelOreTexture('#777777','#35dce5',71),
  emerald:pixelOreTexture('#777777','#36c978',81)
};
const materials={
  grass:[mat(textures.grassSide),mat(textures.grassSide),mat(textures.grassTop,{color:0x91bd59}),mat(textures.dirt),mat(textures.grassSide),mat(textures.grassSide)],
  dirt:mat(textures.dirt),stone:mat(textures.stone),sand:mat(textures.sand),
  wood:[mat(textures.oak),mat(textures.oak),mat(textures.oakTop),mat(textures.oakTop),mat(textures.oak),mat(textures.oak)],
  leaves:mat(textures.leaves,{transparent:true,alphaTest:.1,color:0x77ab3a}),
  water:mat(textures.water,{transparent:true,opacity:.62,depthWrite:false,depthTest:true,color:0x3f76e4,side:THREE.DoubleSide}),
  deepslate:mat(oreTextures.deepslate),coal:mat(oreTextures.coal),iron:mat(oreTextures.iron),copper:mat(oreTextures.copper),
  gold:mat(oreTextures.gold),redstone:mat(oreTextures.redstone),diamond:mat(oreTextures.diamond),emerald:mat(oreTextures.emerald)
};

const B={AIR:0,GRASS:1,DIRT:2,STONE:3,SAND:4,WOOD:5,LEAVES:6,WATER:7,DEEPSLATE:8,COAL:9,IRON:10,COPPER:11,GOLD:12,REDSTONE:13,DIAMOND:14,EMERALD:15};
const chunks=new Map(),geometry=new THREE.BoxGeometry(1,1,1),temp=new THREE.Object3D(),broken=new Set();
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
  const h=getHeight(x,z);
  if(y>h)return y<=WATER_LEVEL?B.WATER:B.AIR;
  if(y===h)return h<=WATER_LEVEL+1?B.SAND:B.GRASS;
  if(y>h-4)return h<=WATER_LEVEL+1?B.SAND:B.DIRT;
  const n=oreNoise(x,y,z);
  const deep=y<9;
  if(y<=30&&n>.975)return B.COAL;
  if(y<=28&&n>.985)return B.IRON;
  if(y<=30&&n>.991)return B.COPPER;
  if(y<=20&&n>.995)return B.GOLD;
  if(y<=16&&n>.997)return B.REDSTONE;
  if(y<=16&&n>.9985)return B.DIAMOND;
  if(y<=30&&n>.9992&&Math.abs(x+z)%7===0)return B.EMERALD;
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
    type===B.SAND?materials.sand:type===B.WOOD?materials.wood:type===B.LEAVES?materials.leaves:type===B.WATER?materials.water:type===B.DEEPSLATE?materials.deepslate:type===B.COAL?materials.coal:type===B.IRON?materials.iron:type===B.COPPER?materials.copper:type===B.GOLD?materials.gold:type===B.REDSTONE?materials.redstone:type===B.DIAMOND?materials.diamond:materials.emerald;
}
function createChunk(cx,cz){
  const k=key(cx,cz);if(chunks.has(k))return;
  const blocks=[],sx=cx*CHUNK_SIZE,sz=cz*CHUNK_SIZE;
  for(let x=0;x<CHUNK_SIZE;x++)for(let z=0;z<CHUNK_SIZE;z++){
    const wx=sx+x,wz=sz+z,h=getHeight(wx,wz);
    const bottom=mobile?Math.max(0,h-5):0;
    for(let y=bottom;y<=h;y++){const type=getBlock(wx,y,wz);if(type!==B.AIR&&!broken.has(`${wx},${y},${wz}`))blocks.push({x:wx,y,z:wz,type})}
    if(!mobile&&isTree(wx,wz))for(const tb of treeBlocks(wx,wz))if(!broken.has(`${tb.x},${tb.y},${tb.z}`))blocks.push(tb);
    if(h<WATER_LEVEL)blocks.push({x:wx,y:WATER_LEVEL,z:wz,type:B.WATER});
  }
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
      const b=list[i];temp.position.set(b.x+.5,b.y+.5,b.z+.5);temp.rotation.set(0,0,0);temp.scale.set(1,1,1);temp.updateMatrix();mesh.setMatrixAt(i,temp.matrix);
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
  const origin=camera.position.clone(),dir=new THREE.Vector3();camera.getWorldDirection(dir);
  for(let d=0;d<=6;d+=.04){const p=origin.clone().addScaledVector(dir,d),x=Math.floor(p.x),y=Math.floor(p.y),z=Math.floor(p.z),type=broken.has(`${x},${y},${z}`)?B.AIR:getBlock(x,y,z);if(type!==B.AIR&&type!==B.WATER)return{x,y,z,type}}
  return null;
}
function hardness(type){return type===B.LEAVES?.18:type===B.GRASS||type===B.DIRT||type===B.SAND?.55:type===B.WOOD?1.05:type===B.STONE?1.5:.8}
function setBreakStage(stage,target){
  if(stage<0||!target){breakMesh.visible=false;return}
  breakMesh.position.set(target.x+.5,target.y+.5,target.z+.5);
  for(const mat of breakMesh.material)mat.map=destroyTextures[stage];
  for(const mat of breakMesh.material)mat.needsUpdate=true;
  breakMesh.visible=true;
}
function startBreaking(){
  if(!gameStarted||mobile)return;
  const t=rayBlock();if(!t)return;
  breaking=true;breakTarget=t;breakStart=performance.now();breakDuration=hardness(t.type)*1000;breakStage=0;setBreakStage(0,t);
}
function stopBreaking(){breaking=false;breakTarget=null;breakStage=-1;breakMesh.visible=false}
function finishBreaking(t){
  const k=`${t.x},${t.y},${t.z}`;broken.add(k);
  const cx=Math.floor(t.x/CHUNK_SIZE),cz=Math.floor(t.z/CHUNK_SIZE);
  unloadChunk(cx,cz);createChunk(cx,cz);
  stopBreaking();
}
document.addEventListener('mousedown',e=>{if(e.button===0)startBreaking()});
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
document.addEventListener('keydown',e=>{keys[e.code]=true;if(/^Digit[1-9]$/.test(e.code)){selectedSlot=Number(e.code.slice(5))-1;updateHotbar()}if(e.code==='KeyE'&&gameStarted){inventoryOpen=!inventoryOpen;document.getElementById('inventory').classList.toggle('open',inventoryOpen);if(inventoryOpen&&locked)document.exitPointerLock()}if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault()});
document.addEventListener('keyup',e=>keys[e.code]=false);
document.addEventListener('wheel',e=>{if(!gameStarted||inventoryOpen)return;selectedSlot=(selectedSlot+(e.deltaY>0?1:8))%9;updateHotbar()},{passive:true});
document.addEventListener('mousedown',e=>{if(e.button===0){const now=performance.now();clickTimes.push(now);clickTimes=clickTimes.filter(t=>now-t<1000);cps=clickTimes.length}});
document.getElementById('play').addEventListener('click',()=>{gameStarted=true;document.getElementById('start').style.display='none';if(!mobile)renderer.domElement.requestPointerLock()});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.05);
  if(gameStarted&&!inventoryOpen)move(dt);if(breaking){const t=rayBlock();if(!t||t.x!==breakTarget.x||t.y!==breakTarget.y||t.z!==breakTarget.z)stopBreaking();else{const p=(performance.now()-breakStart)/breakDuration,stage=Math.min(9,Math.floor(p*10));if(stage!==breakStage){breakStage=stage;setBreakStage(stage,breakTarget)}if(p>=1)finishBreaking(t)}}
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

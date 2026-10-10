import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';

export class MassView {
  constructor(container) {
    this.container=container;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#efeeeb');
    this.camera=new THREE.PerspectiveCamera(40,1,.1,5000);this.camera.up.set(0,0,1);
    this.renderer=new THREE.WebGLRenderer({antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    container.appendChild(this.renderer.domElement);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x80776e,2));
    const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-100,-150,300);this.scene.add(light);
    this.group=new THREE.Group();this.scene.add(this.group);
    this.resize=new ResizeObserver(()=>{const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();});this.resize.observe(container);
    this.renderer.setAnimationLoop(()=>{if(container.hidden)return;this.controls.update();this.renderer.render(this.scene,this.camera);});
  }
  clear() {while(this.group.children.length){const o=this.group.children[0];this.group.remove(o);o.geometry?.dispose();o.material?.dispose();}}
  show(data,boundary,reserves) {
    this.clear();
    const ring=data.footprint.coordinates[0];const xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]);
    const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
    const lines=(ring,z,color,width=1)=>{
      const geo=new THREE.BufferGeometry().setFromPoints(ring.map(p=>new THREE.Vector3(p[0]-cx,p[1]-cy,z)));
      this.group.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color,linewidth:width})));
    };
    const ground=(geometry,color)=>{
      const parts=geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;
      for(const part of parts){const s=new THREE.Shape(part[0].slice(0,-1).map(p=>new THREE.Vector2(p[0]-cx,p[1]-cy)));for(const hole of part.slice(1))s.holes.push(new THREE.Path(hole.slice(0,-1).map(p=>new THREE.Vector2(p[0]-cx,p[1]-cy))));const geo=new THREE.ShapeGeometry(s);const mat=new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.35});this.group.add(new THREE.Mesh(geo,mat));lines(part[0],.04,color);}
    };
    ground(boundary,0xb7b1a4);reserves.forEach(r=>ground(r.geometry,0x75a3b0));
    for(const mesh of data.meshes){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(mesh.vertices.flatMap(v=>[v[0]-cx,v[1]-cy,v[2]]),3));geo.setIndex(mesh.faces.flat());geo.computeVertexNormals();this.group.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xd1bea9,roughness:.75,metalness:.05,side:THREE.DoubleSide})));this.group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo,20),new THREE.LineBasicMaterial({color:0x817362,transparent:true,opacity:.4})));}
    for(const floor of data.floors)for(const loop of data.footprint.coordinates)lines(loop,floor.elevation+.01,floor.use==='parking'?0x687a8c:0xa99a86);
    for(const loop of data.footprint.coordinates)lines(loop,data.heightM,0x817362);
    const extent=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys),data.heightM)*1.35;
    this.controls.target.set(0,0,data.heightM*.3);this.camera.position.set(extent,-extent,extent*.9);this.controls.update();
  }
}

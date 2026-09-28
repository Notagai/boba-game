/* 3D boba-cup prototype built around Evan Wallace's WebGL Water heightfield. */
var gl = GL.create();
var water;
var waterMesh;
var waterShader;
var solidShader;
var glassShader;
var pearlMesh;
var cylinderMesh;
var ringMesh;
var strawMesh;
var angleX = -12;
var angleY = 28;
var paused = false;

function makeCylinder(radius, height, segments, includeBottom) {
  var mesh = new GL.Mesh({normals:true});
  for (var i = 0; i < segments; i++) {
    var a0 = i / segments * Math.PI * 2;
    var a1 = (i + 1) / segments * Math.PI * 2;
    var c0 = Math.cos(a0), s0 = Math.sin(a0);
    var c1 = Math.cos(a1), s1 = Math.sin(a1);
    var base = mesh.vertices.length;
    mesh.vertices.push([radius*c0,-height/2,radius*s0],[radius*c1,-height/2,radius*s1],
                       [radius*c1,height/2,radius*s1],[radius*c0,height/2,radius*s0]);
    mesh.normals.push([c0,0,s0],[c1,0,s1],[c1,0,s1],[c0,0,s0]);
    mesh.triangles.push([base,base+1,base+2],[base,base+2,base+3]);
  }
  if (includeBottom) {
    var center = mesh.vertices.length;
    mesh.vertices.push([0,-height/2,0]);
    mesh.normals.push([0,-1,0]);
    for (var j=0;j<segments;j++) {
      var a0=j/segments*Math.PI*2, a1=(j+1)/segments*Math.PI*2, b=mesh.vertices.length;
      mesh.vertices.push([radius*Math.cos(a0),-height/2,radius*Math.sin(a0)],
                         [radius*Math.cos(a1),-height/2,radius*Math.sin(a1)]);
      mesh.normals.push([0,-1,0],[0,-1,0]);
      mesh.triangles.push([center,b+1,b]);
    }
  }
  mesh.compile();
  return mesh;
}

function makeRing(major, minor, segments, sides) {
  var mesh = new GL.Mesh({normals:true});
  for (var i=0;i<segments;i++) {
    for (var j=0;j<sides;j++) {
      var a0=i/segments*Math.PI*2, a1=(i+1)/segments*Math.PI*2;
      var b0=j/sides*Math.PI*2, b1=(j+1)/sides*Math.PI*2;
      var p=[];
      [[a0,b0],[a1,b0],[a1,b1],[a0,b1]].forEach(function(v){
        var a=v[0], b=v[1], rr=major+minor*Math.cos(b);
        p.push([rr*Math.cos(a), minor*Math.sin(b), rr*Math.sin(a)]);
      });
      var base=mesh.vertices.length;
      p.forEach(function(v){mesh.vertices.push(v);});
      for (var k=0;k<4;k++){var q=p[k], len=Math.hypot(q[0]-major*Math.cos(k? (k<3?a1:a0):a0),q[1],q[2]-major*Math.sin(k? (k<3?a1:a0):a0)); mesh.normals.push([q[0]/Math.max(0.001,major),q[1]/Math.max(0.001,minor),q[2]/Math.max(0.001,major)]);}
      mesh.triangles.push([base,base+1,base+2],[base,base+2,base+3]);
    }
  }
  mesh.compile();
  return mesh;
}

var litVertex = 'varying vec3 vPos; varying vec3 vNormal; void main(){ vPos=gl_Vertex.xyz; vNormal=gl_Normal; gl_Position=gl_ModelViewProjectionMatrix*vec4(gl_Vertex,1.0); }';
var litFragment = 'uniform vec3 color; uniform vec3 lightDir; varying vec3 vPos; varying vec3 vNormal; void main(){ vec3 n=normalize(vNormal); float d=max(0.0,dot(n,normalize(lightDir))); float rim=pow(1.0-max(0.0,dot(n,vec3(0.0,0.0,1.0))),2.0); gl_FragColor=vec4(color*(0.35+0.75*d)+rim*0.08,1.0); }';
var glassFragment = 'uniform vec3 tint; varying vec3 vNormal; void main(){ vec3 n=normalize(vNormal); float d=0.45+0.55*max(0.0,dot(n,normalize(vec3(0.3,0.8,0.4)))); gl_FragColor=vec4(tint*d,0.22); }';

waterShader = new GL.Shader(
  'uniform sampler2D water; varying vec3 pos; varying vec3 nrm; void main(){ vec2 uv=gl_Vertex.xy*0.5+0.5; vec4 info=texture2D(water,uv); pos=gl_Vertex.xzy; pos.y += 0.25 + info.r*0.55; nrm=normalize(vec3(info.b,1.0,info.a)); gl_Position=gl_ModelViewProjectionMatrix*vec4(pos,1.0); }',
  'uniform sampler2D water; uniform vec3 tea; uniform vec3 lightDir; varying vec3 pos; varying vec3 nrm; void main(){ if(dot(pos.xz,pos.xz)>0.72) discard; vec3 n=normalize(nrm); float d=0.35+0.65*max(0.0,dot(n,normalize(lightDir))); float edge=pow(1.0-max(0.0,n.y),2.0); vec3 c=tea*d+vec3(0.10,0.055,0.02)*edge; gl_FragColor=vec4(c,1.0); }'
);
solidShader = new GL.Shader(litVertex,litFragment);
glassShader = new GL.Shader(litVertex,glassFragment);

function init() {
  document.body.appendChild(gl.canvas);
  gl.canvas.style.position='absolute';
  gl.canvas.style.inset='0';
  gl.clearColor(0.035,0.025,0.02,1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  water = new Water();
  waterMesh = GL.Mesh.plane({detail:180});
  pearlMesh = GL.Mesh.sphere({detail:12});
  cylinderMesh = makeCylinder(1,2,96,true);
  ringMesh = makeRing(0.92,0.045,96,12);
  strawMesh = makeCylinder(0.045,2.6,32,false);
  for(var i=0;i<18;i++) water.addDrop((Math.random()*1.4)-0.7,(Math.random()*1.4)-0.7,0.045,0.015);
  resize();
  draw();
  var last=performance.now();
  function frame(now){
    var dt=Math.min(0.05,(now-last)/1000); last=now;
    if(!paused){ water.stepSimulation(); water.stepSimulation(); water.updateNormals(); }
    draw(); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.onresize=resize;
  document.onkeydown=function(e){ if(e.code==='Space'){paused=!paused;e.preventDefault();} };
  var dragging=false,lastX=0,lastY=0;
  document.onmousedown=function(e){dragging=true;lastX=e.clientX;lastY=e.clientY;};
  document.onmouseup=function(){dragging=false;};
  document.onmousemove=function(e){if(!dragging)return;angleY+=e.clientX-lastX;angleX+=e.clientY-lastY;angleX=Math.max(-55,Math.min(45,angleX));lastX=e.clientX;lastY=e.clientY;};
  document.onwheel=function(e){ cameraZ=Math.max(3.2,Math.min(7,cameraZ+e.deltaY*0.004)); };
}

var cameraZ=5.1;
function resize(){ var r=window.devicePixelRatio||1; gl.canvas.width=innerWidth*r; gl.canvas.height=innerHeight*r; gl.canvas.style.width=innerWidth+'px'; gl.canvas.style.height=innerHeight+'px'; gl.viewport(0,0,gl.canvas.width,gl.canvas.height); gl.matrixMode(gl.PROJECTION);gl.loadIdentity();gl.perspective(38,gl.canvas.width/gl.canvas.height,0.01,100);gl.matrixMode(gl.MODELVIEW); }

function draw(){
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.loadIdentity(); gl.translate(0,-0.05,-cameraZ); gl.rotate(angleX,1,0,0); gl.rotate(angleY,0,1,0); gl.translate(0,-0.05,0);
  gl.disable(gl.CULL_FACE);
  water.textureA.bind(0);
  waterShader.uniforms({water:0,tea:[0.30,0.12,0.035],lightDir:[-0.5,1,0.35]}).draw(waterMesh);
  gl.enable(gl.CULL_FACE);
  gl.pushMatrix(); gl.translate(0,0.05,0); gl.scale(1.0,1.0,1.0); solidShader.uniforms({color:[0.10,0.035,0.012],lightDir:[-0.5,1,0.35]}).draw(cylinderMesh); gl.popMatrix();
  gl.pushMatrix(); gl.translate(0,1.32,0); solidShader.uniforms({color:[0.10,0.035,0.012],lightDir:[-0.5,1,0.35]}).draw(ringMesh); gl.popMatrix();
  gl.depthMask(false); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  gl.pushMatrix(); gl.translate(0,0.05,0); gl.scale(1.015,1.0,1.015); glassShader.uniforms({tint:[0.86,0.92,0.95]}).draw(cylinderMesh); gl.popMatrix();
  gl.depthMask(true); gl.disable(gl.BLEND);
  gl.disable(gl.CULL_FACE);
  for(var i=0;i<14;i++){
    var a=i*2.39996, rr=0.18+(i%4)*0.15, y=-0.55+(i%5)*0.22;
    gl.pushMatrix(); gl.translate(Math.cos(a)*rr,y,Math.sin(a)*rr); gl.scale(0.095,0.095,0.095);
    solidShader.uniforms({color:[0.035,0.012,0.006],lightDir:[-0.5,1,0.35]}).draw(pearlMesh); gl.popMatrix();
  }
  gl.enable(gl.CULL_FACE);
  gl.pushMatrix(); gl.translate(0.38,1.42,0.05); gl.rotate(-8,0,0,1); solidShader.uniforms({color:[0.90,0.68,0.20],lightDir:[-0.5,1,0.35]}).draw(strawMesh); gl.popMatrix();
}

window.onload=init;

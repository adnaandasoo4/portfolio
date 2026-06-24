// Locked visual parameters (from the approved prototype). See the foundation
// spec §2.3. These map 1:1 to the prototype's final slider values.
export const TOPO_PARAMS = {
  density: 3.5, // Line count
  scale: 50, // Scale slider raw value (shader multiplies by 0.01 -> 0.50)
  speedPct: 30, // Morph speed %
  weight: 140, // Thinness slider raw value (shader * 0.01 -> 1.40 px half-width)
  coverage: 50, // Coverage %
  breathe: 50, // Breathe %
  opacityPct: 10, // Opacity %
};

const rgb = (h) => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];

// Selectable identities for the dark backdrop. The light (paper) backdrop is
// shared across all of them. Each `line` is the palette's bright accent (the
// contour-line color), mirrored in CSS as --lime.
export const DARK_PALETTES = {
  green: { bg: rgb("#292E21"), line: rgb("#DCFE4F"), ink: rgb("#DEE1D3") }, // green bg, lime lines
  oxblood: { bg: rgb("#200B10"), line: rgb("#8A8E94"), ink: rgb("#E6E3DD") }, // dark muted oxblood, darker silver-gray lines
  blue: { bg: rgb("#0F1B30"), line: rgb("#8FC2F2"), ink: rgb("#D7E1EE") }, // midnight navy, light-blue lines
  graphite: { bg: rgb("#24262B"), line: rgb("#E0A94A"), ink: rgb("#DEE1E6") }, // graphite charcoal, amber lines
};

// Per-backdrop background + contour-line colors. `dark` is mutated in place by
// setDarkPalette so live readers (the field's per-frame loop, OverlayTopo) pick
// up palette swaps without re-instantiating their GL contexts.
export const BACKDROP_COLORS = {
  dark: { ...DARK_PALETTES.green },
  light: { bg: rgb("#F1EFE8"), line: rgb("#292C21"), ink: rgb("#292C21") }, // paper bg, dark-green lines, dark ink
};

// Swap the active dark palette. Mutates the existing `dark` object's properties
// (rather than reassigning it) so references captured at effect-setup stay valid.
export function setDarkPalette(name) {
  const p = DARK_PALETTES[name] || DARK_PALETTES.green;
  BACKDROP_COLORS.dark.bg = p.bg;
  BACKDROP_COLORS.dark.line = p.line;
  BACKDROP_COLORS.dark.ink = p.ink;
}

export const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}`;

export const FRAG = `
precision highp float;
uniform vec2 uRes;uniform float uTime;
uniform vec3 uBg;uniform vec3 uLine;
uniform vec3 uBg2;uniform vec3 uLine2;uniform vec2 uCenter;uniform float uRadius;uniform float uEdge;
uniform float uDensity;uniform float uScale;uniform float uWeight;uniform float uAmt;
uniform float uBreathe;uniform float uCoverage;
vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);
  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m;m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}
float fbm(vec2 p){
  float s=0.0,a=0.6;mat2 r=mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<2;i++){s+=a*snoise(p);p=r*p*2.0;a*=0.5;}
  return s;
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes.xy;
  vec2 p=vec2(uv.x*(uRes.x/uRes.y),uv.y)*(uScale*0.01);
  float t=uTime;
  vec2 q=vec2(fbm(p+vec2(0.0,t*0.04)),fbm(p+vec2(3.7,1.1-t*0.035)));
  float n=fbm(p+0.6*q+vec2(t*0.015,t*0.01));
  float bands=n*uDensity;
  float dpx=abs(fract(bands)-0.5)/fwidth(bands);
  float lw=uWeight*0.01;
  float line=1.0-smoothstep(0.0,lw,dpx);
  float b1=fbm(p*0.9+vec2(-t*0.035,t*0.028));
  float b2=fbm(p*1.5+vec2(t*0.022,-t*0.03)+11.0);
  float br=0.6*b1+0.4*b2;
  float bias=(uCoverage-50.0)*0.02;
  float breath=mix(1.0,smoothstep(-0.75,0.55,br+bias),uBreathe*0.01);
  float ink=clamp(line*breath*uAmt,0.0,1.0);
  vec3 colOld=mix(uBg,uLine,ink);
  vec3 colNew=mix(uBg2,uLine2,ink);
  float mask=0.0;
  if(uRadius>0.0){
    vec2 auv=vec2(uv.x*(uRes.x/uRes.y),uv.y);
    float d=distance(auv,uCenter);
    mask=1.0-smoothstep(uRadius-uEdge,uRadius+uEdge,d);
  }
  gl_FragColor=vec4(mix(colOld,colNew,mask),1.0);
}`;

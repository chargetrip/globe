varying vec2 vUv;
varying vec3 vInstanceColor;

void main() {
  vec3 transformed = vec3( position );

  vec4 mvPosition = vec4( transformed, 1.0 );
  mvPosition = instanceMatrix * mvPosition;
  
  vInstanceColor = instanceColor;

  vec4 modelViewPosition = modelViewMatrix * mvPosition;
  vUv = uv;
  
  gl_Position = projectionMatrix * modelViewPosition;
}

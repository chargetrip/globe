uniform vec3 viewVector;
uniform float c;
uniform float p;

varying float intensity;

void main() {
  vec3 vNormal = normalize( normalMatrix * normal );
	vec3 vNormel = normalize( normalMatrix * viewVector );

  float zoomFactor = smoothstep(800.0, 2000.0, viewVector.z);

	// intensity = pow( 0.4 - clamp(0.0, 1.0, dot( vNormal, vNormel ) ), 4.0 );
	// intensity = pow( 0.4 - clamp(0.0, 1.0, dot( vNormal, vNormel ) ), 4.0 );
	intensity = zoomFactor;
	
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}


// varying vec3 vertexNormal;

// void main() {
//     vertexNormal = normalize(normalMatrix * normal);

//     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// }

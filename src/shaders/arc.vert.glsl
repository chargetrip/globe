attribute float distance;

varying float vDistance;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

	vDistance = distance;
	vNormal = normalize( normalMatrix * normal );
	vViewPosition = - mvPosition.xyz;

	gl_Position = projectionMatrix * mvPosition;

}
uniform float fraction;

varying float vDistance;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
	if ( vDistance > fraction ) discard;

	vec3 color = vec3( 0.25, 0.5, 1.0 );

	gl_FragColor = vec4(color, 1.0);
}
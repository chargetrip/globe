uniform vec4 startColor;
uniform vec4 endColor;

varying vec3 vUv;

void main() {
	gl_FragColor = mix(startColor, endColor, vUv.z);
}

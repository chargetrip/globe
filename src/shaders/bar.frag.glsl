uniform vec4 endColor;
uniform vec4 startColor;

varying vec3 vUv;

void main() {
    gl_FragColor = mix(endColor, startColor, vUv.z);
}

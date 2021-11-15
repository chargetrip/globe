uniform vec4 color1;
uniform vec4 color2;

varying vec3 vUv;

void main() {
    gl_FragColor = mix(color1, color2, vUv.y);
}

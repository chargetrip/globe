varying vec2 vUv;
varying vec3 vInstanceColor;

uniform float time;
uniform vec3 color;

void main() {
    float intensity = (sin(vInstanceColor.x * vInstanceColor.y * vInstanceColor.z * time * 10.0) + 1.0) / 2.0;

    vec3 dotColor = color;

    vec3 color = mix(dotColor, dotColor * 1.75, intensity);

    gl_FragColor = vec4(color, 1.0);
}

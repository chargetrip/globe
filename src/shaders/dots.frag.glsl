varying vec2 vUv;
varying vec3 vInstanceColor;

uniform float time;
uniform vec3 color;

void main() {
    float rand_val = max(
      vInstanceColor.x + vInstanceColor.y + vInstanceColor.z,
      0.2
    );

    float intensity = (sin((time * rand_val) * 2.5) + 1.0) / 2.0;

    gl_FragColor = vec4(color, max(intensity, 0.3));
}

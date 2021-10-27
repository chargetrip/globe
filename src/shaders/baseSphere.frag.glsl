uniform vec3 color;
varying vec3 vertexNormal;

void main() {
    float intensity = clamp(0.9 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    vec3 atmosphere = vec3(0.5, 0.7, 1.0) * pow(intensity, 4.5);

    gl_FragColor = vec4(atmosphere + color, 1);
}

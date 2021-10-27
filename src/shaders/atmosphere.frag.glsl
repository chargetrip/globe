uniform vec3 color;
varying vec3 vertexNormal;

void main() {
    float intensity = pow(0.8 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.0);
    float dropoff = dot(vertexNormal.xy, vec2(-1.0, 1.0)) * 1.1;

    gl_FragColor = vec4(color * dropoff, 1.0) * intensity;
}
